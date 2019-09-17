import { action, computed, observable } from 'mobx';
import dayjs from 'dayjs';

import { CreateUserDto, UpdateProfileSettingDto, UserEntity } from '@lib/common/interfaces/user';
import { request } from '@lib/common/utils/request';
import { oauthToken, oauth } from '@lib/services/oauth';
import { OauthType } from '@common/enum/router';
import { CredentialsEntity } from '@lib/common/interfaces/credentials';
import { getUserCredentialList } from '@lib/services/credentials';

export class AccountStore {
  @computed get isLogin() {
    return !!this.userInfo;
  }

  /**
   * 登录的用户信息
   *
   * @type {UserEntity}
   * @memberof AccountStore
   */
  @observable public userInfo?: UserEntity;

  @observable public userCredentials: CredentialsEntity[] = [];

  // 用来初始化
  public update = (store?: Partial<AccountStore>) => {
    if (store) {
      if (store.userInfo !== undefined) {
        this.setUserInfo(store.userInfo);
      }
    }
  }

  @action
  public setUserInfo = (userInfo?: UserEntity) => {
    this.userInfo = userInfo;
  }

  public updateProfile = async (userInfo: UpdateProfileSettingDto, avatar?: File) => {
    const params = new FormData();
    // eslint-disable-next-line no-restricted-syntax
    for (const key in userInfo) {
      if (key) {
        params.append(key, (userInfo as any)[key]);
      }
    }
    if (avatar) {
      params.append('avatar', avatar);
    }
    const { data } = await request.post<UserEntity>(`/api/user/${this.userInfo!.username}/setting/profile`, params);
    this.setUserInfo(data);
  }

  public getCredentials = async () => {
    const { data } = await getUserCredentialList();
    this.setCredentials(data);
  }

  @action
  public setCredentials = (data: CredentialsEntity[]) => this.userCredentials = data;

  /**
   * 登录
   *
   * @memberof AccountStore
   */
  public login = async (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('grant_type', 'password');
    const data = await oauth(params);
    localStorage.setItem('token', JSON.stringify(data.data));
    this.setUserInfo(data.data.user);
  }

  /**
   * code登录
   *
   * @memberof AccountStore
   */
  public codeLogin = async (code: string, type: OauthType) => {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    const data = await oauthToken(type, params);
    localStorage.setItem('token', JSON.stringify(data.data));
    this.setUserInfo(data.data.user);
  }

  public refreshToken = async () => {
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    if (token && token.refreshTokenExpiresAt && dayjs(token.refreshTokenExpiresAt) > dayjs()) {
      const params = new URLSearchParams();
      params.append('refresh_token', token.refreshToken);
      params.append('grant_type', 'refresh_token');
      const { data } = await oauth(params);
      localStorage.setItem('token', JSON.stringify(data));
    } else {
      throw new Error('invalid token');
    }
  }

  public existToken = () => {
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    return token && token.accessTokenExpiresAt && token.refreshTokenExpiresAt;
  }

  public isRefreshTokenOk = () => {
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    if (!token || !token.refreshTokenOkExpiresAt) {
      return true;
    }
    if (dayjs(token.refreshTokenOkExpiresAt) > dayjs()) {
      return true;
    }
    return false;
  }

  public isAccessTokenOk = () => {
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    if (!token || !token.accessTokenExpiresAt) {
      return true;
    }
    if (dayjs(token.accessTokenExpiresAt) > dayjs()) {
      return true;
    }
    return false;
  }

  public logout = async () => {
    await request.post('auth/logout');
    window.location.href = '/';
  }

  public signup = async (value: CreateUserDto) => {
    await request.post('auth/signup', value);
  }
}
