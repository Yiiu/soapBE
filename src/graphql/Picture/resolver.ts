import * as path from 'path';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Inject, Service } from 'typedi';

import { Picture, PictureInfo } from '@entities/Picture';
import { PictureService } from '@services/Picture';
import { formatError } from '@utils/formatError';
import { qiniuUpload } from '@utils/qiniu';
import { storeUpload } from '@utils/upload';
import { ApolloError, GraphQLUpload } from 'apollo-server-core';
import { Upload } from 'typing';

@Service()
@Resolver(of => Picture)
export class PictureResolver {
  @Inject()
  public pictureService: PictureService;

  @Query(returns => [Picture])
  public async pictures(
    @Arg('userId', {
      nullable: true,
    }) userId: string,
  ) {
    const data = await this.pictureService.getList(userId);
    return data;
  }

  @Query(returns => Picture)
  public async picture(
    @Arg('id') id?: string,
  ) {
    const data = await this.pictureService.getOne(id);
    if (!data) {
      throw new ApolloError(`not resolve a Picture id '${id}'`, 'NOT_FOUND');
    }
    return data;
  }

  @Authorized()
  @Mutation(returns => Picture)
  public async upload(
    @Arg('file', type => GraphQLUpload) file: Upload,
    @Arg('info') info: PictureInfo,
    @Ctx() context: any,
  ): Promise<any> {
    try {
      const { id, pathname } = await storeUpload(file.stream, file.filename, path.join(__dirname, '../../../upload'));
      const data = await qiniuUpload(pathname, id);
      const picture = await this.pictureService.add({
        info,
        key: data.key,
        hash: data.hash,
        user: context.req.auth.user.id,
      });
      return picture;
    } catch (err) {
      throw formatError(err);
    }
  }
}
