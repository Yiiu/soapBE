import { action, observable } from 'mobx';

import { CommentEntity } from '@lib/common/interfaces/comment';
import { PictureEntity } from '@lib/common/interfaces/picture';
import { addComment, getPictureComment } from '@lib/services/comment';
import { getPicture, likePicture, unlikePicture } from '@lib/services/picture';

import { HttpStatus } from '@lib/common/enums/http';
import { BaseStore } from '../base/BaseStore';

export class PictureScreenStore extends BaseStore {
  @observable public info!: PictureEntity;

  @observable public comment: CommentEntity[] = [];

  @observable public id!: number;

  public cacheData: Record<string, PictureEntity> = {};

  @action public setInfo = (data: PictureEntity) => {
    this.id = data.id;
    this.info = data;
  }

  public getPictureInfo = async (id: string, header?: any) => {
    const { data } = await getPicture(id, header);
    if (!data) {
      return {
        error: {
          statusCode: HttpStatus.NOT_FOUND,
        },
      };
    }
    this.setInfo(data);
    this.setCache(this.id, this.info);
    return undefined;
  }

  @action public getComment = async () => {
    const { data } = await getPictureComment(this.id);
    this.comment = data.data;
  }

  public addComment = async (content: string) => {
    const { data } = await addComment(content, this.id);
    this.pushComment(data);
  }

  @action public pushComment = (comment: CommentEntity) => {
    this.comment.unshift(comment);
  }

  @action
  public like = async () => {
    try {
      let func = unlikePicture;
      if (!this.info.isLike) {
        func = likePicture;
      }
      const { data } = await func(this.info.id);
      this.info.isLike = data.isLike;
      this.info.likes = data.count;
    // tslint:disable-next-line: no-empty
    } catch (err) {
      console.error(err);
    }
  }

  public setCache = (id: ID, data: PictureEntity) => {
    this.cacheData[id] = data;
  }

  public getCache = (type = '') => {
    if (this.cacheData[type]) {
      this.setInfo(this.cacheData[type]);
    }
  }

  public isCache = (type = '') => this.cacheData[type] !== undefined;
}
