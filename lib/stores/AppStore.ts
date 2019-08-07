import { action, observable, reaction } from 'mobx';

import NProgress from 'nprogress';
import { CollectionEntity } from '@lib/common/interfaces/collection';
import { getUserCollection } from '@lib/services/collection';
import { UserEntity } from '@lib/common/interfaces/user';
import { store } from './init';

export type RouterAction = 'POP' | 'PUSH' | 'REPLACE';

interface ILocation {
  href: string;
  options?: {
    shallow?: boolean;
    [key: string]: string | boolean | number | undefined;
  };
  as: string;
  action: RouterAction;
}

export class AppStore {
  @observable.shallow public userCollection: CollectionEntity[] = []

  @observable public loading = false;

  @observable public location?: ILocation;

  @observable public userList: Map<string, UserEntity> = new Map();

  constructor() {
    reaction(
      () => this.loading,
      (loading: boolean) => {
        if (loading) {
          NProgress.start();
        } else {
          NProgress.done();
        }
      },
    );
  }

  @action
  public setLoading = (value: boolean) => this.loading = value

  @action
  public setRoute = (value: ILocation) => {
    this.location = value;
  }

  @action
  public getCollection = async () => {
    const { accountStore } = store;
    if (accountStore.userInfo) {
      const { data } = await getUserCollection(accountStore.userInfo.username);
      this.userCollection = data.data;
    }
  }
}
