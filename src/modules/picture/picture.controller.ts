import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { CommentService } from '@server/modules/comment/comment.service';
import { GetPictureCommentListDto } from '@server/modules/comment/dto/comment.dto';
import { Roles } from '@server/common/decorator/roles.decorator';
import { User } from '@server/common/decorator/user.decorator';
import { AllExceptionFilter } from '@server/common/filter/exception.filter';
import { AuthGuard } from '@server/common/guard/auth.guard';
import { QiniuService } from '@server/shared/qiniu/qiniu.service';
import { Role } from '@server/modules/user/enum/role.enum';
import { UserEntity } from '@server/modules/user/user.entity';
import { RedisService } from 'nestjs-redis';
import dayjs from 'dayjs';
import { keyword } from '@server/common/utils/keyword';
import { CreatePictureAddDot, GetPictureListDto, UpdatePictureDot } from './dto/picture.dto';
import { PictureService } from './picture.service';
import { FileService } from '../file/file.service';

@Controller('api/picture')
@UseGuards(AuthGuard)
@UseFilters(new AllExceptionFilter())
export class PictureController {
  constructor(
    private readonly qiniuService: QiniuService,
    private readonly commentService: CommentService,
    private readonly pictureService: PictureService,
    private readonly fileService: FileService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  @Roles(Role.USER)
  public async upload(
    @Body() body: CreatePictureAddDot,
    @User() user: UserEntity,
  ) {
    const { info, tags = [], ...restInfo } = body;
    const file = await this.fileService.getOne(body.key);
    if (file) {
      await Promise.all([
        this.fileService.activated(body.key),
        this.pictureService.create({
          ...info,
          ...restInfo,
          tags,
          user,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          key: file.key,
          hash: file.hash,
        }),
      ]);
      return;
    }
    throw new BadRequestException('no file');
  }

  @Delete(':id')
  @Roles(Role.USER)
  public async deletePicture(
    @Param('id') id: number,
    @User() user: UserEntity,
  ) {
    return this.pictureService.delete(id, user);
  }


  @Put(':id')
  @Roles(Role.USER)
  public async updatePicture(
    @Param('id') id: number,
    @Body() data: UpdatePictureDot,
    @User() user: UserEntity,
  ) {
    return this.pictureService.update(id, data, user);
  }

  @Get()
  public async getList(
    @User() user: Maybe<UserEntity>,
    @Query() query: GetPictureListDto,
  ) {
    return this.pictureService.getList(user, query);
  }

  @Get(':id([0-9]+)')
  public async getOne(
    @Param('id') id: string,
    @User() user: UserEntity,
  ) {
    return this.pictureService.getOnePicture(Number(id), user, true);
  }

  @Put('like/:id([0-9]+)')
  @Roles(Role.USER)
  public async likePicture(
    @Param('id') id: string,
    @User() user: UserEntity,
  ) {
    return this.pictureService.likePicture(Number(id), user, true);
  }


  @Put('unlike/:id([0-9]+)')
  @Roles(Role.USER)
  public async unlikePicture(
    @Param('id') id: string,
    @User() user: UserEntity,
  ) {
    return this.pictureService.likePicture(Number(id), user, false);
  }

  @Get(':id([0-9]+)/comments')
  public async getPictureCommentList(
    @Param('id') id: string,
    @User() user: Maybe<UserEntity>,
    @Query() query: GetPictureCommentListDto,
  ) {
    return this.commentService.getPictureList(id, query, user);
  }

  @Get('getHot')
  @Roles(Role.OWNER)
  public async createPictureComment(
    @User() user: UserEntity,
  ) {
    if (user.username !== 'yiiu') throw new ForbiddenException();
    const redisClient = this.redisService.getClient();
    const data = await this.pictureService.getHotPictures();
    await redisClient.zadd('picture_hot', ...data);
    console.log(dayjs().format(), 'picture hot OK!!!!!!!!');
    return { message: 'ok' };
  }

  @Get('all/keywords')
  @Roles(Role.OWNER)
  public async setKeywords(
    @User() user: UserEntity,
  ) {
    const list = await this.pictureService.getRawList();
    await Promise.all(
      list.map(async (item) => {
        const keywords = keyword([item.title, item.bio]);
        keywords.unshift(...item.tags.map(tag => tag.name));
        item.keywords = [...new Set(keywords)].join('|');
        return this.pictureService.updateRaw(item, {
          keywords: [...new Set(keywords)].join('|'),
        });
      }),
    );
    return { message: 'ok' };
  }
}
