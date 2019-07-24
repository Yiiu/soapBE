import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { UseGuards } from '@nestjs/common';
import { Roles } from '@server/common/decorator/roles.decorator';
import { AuthGuard } from '@server/common/guard/auth.guard';
import { UserEntity } from '@server/user/user.entity';
import { GetTagPictureListDto } from './dto/tag.dto';
import { TagService } from './tag.service';

@Resolver()
@UseGuards(AuthGuard)
export class TagResolver {
  constructor(
    private readonly tagService: TagService,
  ) {}

  @Query()
  public async tag(
    @Context('user') user: Maybe<UserEntity>,
    @Args('name') name: string,
  ) {
    return this.tagService.getTagInfo(name, user);
  }

  @Query()
  public async tagPictures(
    @Context('user') user: Maybe<UserEntity>,
    @Args('name') name: string,
    @Args() query: GetTagPictureListDto,
  ) {
    console.log(name, query);
    return this.tagService.getTagPicture(name, user, query);
  }
}