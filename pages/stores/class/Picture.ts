import { observable } from 'mobx';

import { UserEntity } from '@pages/common/interfaces/user';
import { IEXIF } from '@typings/index';

export class PictureClass {
  public id!: number;
  public key!: string;
  public hash!: string;
  public title!: string;
  public bio!: string;
  public views!: number;
  @observable public isLike!: boolean;
  public color!: string;
  public isDark!: boolean;
  public height!: number;
  public width!: number;
  public make!: string;
  public model!: string;
  public exif!: IEXIF;
  public user!: UserEntity;
  public like = () => {
    this.isLike = !this.isLike;
  }
}
