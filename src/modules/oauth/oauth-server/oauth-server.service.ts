import { Injectable } from '@nestjs/common';

import { getTokenExpiresAt } from '@server/common/utils/token';
import { UserEntity } from '@server/modules/user/user.entity';
import { UserService } from '@server/modules/user/user.service';
import { RedisService } from 'nestjs-redis';
import { AccessTokenEntity } from '../access-token/access-token.entity';
import { AccessTokenService } from '../access-token/access-token.service';
import { ClientEntity } from '../client/client.entity';
import { ClientService } from '../client/client.service';
import { IGithubCode } from '../oauth.interface';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const OAuth2Server = require('oauth2-server');

@Injectable()
export class OauthServerService {
  public server: any;

  private getAccessToken = this.accessTokenService.getAccessToken

  private getRefreshToken = this.accessTokenService.getRefreshToken

  constructor(
    private readonly clientService: ClientService,
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly redisService: RedisService,
  ) {
    this.server = new OAuth2Server({
      model: {
        getClient: this.getClient,
        saveToken: this.saveToken,
        getAccessToken: this.getAccessToken,
        getRefreshToken: this.getRefreshToken,
        verifyScope: this.verifyScope,
        revokeToken: this.revokeToken,
        getUser: this.getUser,
        getAuthorizationCode: this.getAuthorizationCode,
        revokeAuthorizationCode: this.revokeAuthorizationCode,
      },
    });
  }

  private getClient = async (clientId: string, clientSecret: string) => {
    const client = await this.clientService.getOne(clientId, clientSecret);
    return client;
  }

  private saveToken = async ({ accessToken, refreshToken }: any, client: ClientEntity, user: UserEntity) => {
    const token = {
      client,
      user,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: getTokenExpiresAt(client.accessTokenLifetime),
      refreshTokenExpiresAt: getTokenExpiresAt(client.refreshTokenLifetime),
    };
    const newToken = await this.accessTokenService.create(token);
    return newToken;
  }

  private verifyScope = async () => true

  private revokeToken = async (token: AccessTokenEntity) => {
    if (token) {
      if (token.refreshTokenExpiresAt >= new Date()) {
        return true;
      }
    }
    return false;
  }

  private getUser = async (email: string, password: string) => {
    const user = await this.userService.verifyUser(email, password);
    return user;
  }

  private getAuthorizationCode = async (code: string, client: ClientEntity) => {
    const redisClient = this.redisService.getClient();
    console.log(123123213, client);
    const data = await redisClient.get(`oauth_code_${code}`);
    if (!data) return null;
    return JSON.parse(data!);
  }

  private revokeAuthorizationCode = async (code: IGithubCode) => {
    console.log('revokeAuthorizationCode', code);
  }
}
