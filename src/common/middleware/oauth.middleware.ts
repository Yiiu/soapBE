import { Injectable, NestMiddleware } from '@nestjs/common';
import * as OAuth2Server from 'oauth2-server';

import { OauthServerService } from '@server/oauth/oauth-server/oauth-server.service';
import { UserEntity } from '@server/user/user.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class OauthMiddleware implements NestMiddleware {
  constructor(
    private readonly oauthServerService: OauthServerService,
  ) {}
  public async use(req: any, res: any, next: () => void) {
    const isReq = /text\/html|application\/json/g.test(req.headers.accept);
    if (!isReq) {
      next();
      return;
    }
    // 处理cookie
    if (req.cookies.Authorization) {
      req.headers.Authorization = req.cookies.Authorization;
    }
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);
    try {
      const token = await this.oauthServerService.server.authenticate(request, response);
      req.user = plainToClass(UserEntity, token.user);
    } catch (err) {
      req.user = null;
    }
    next();
  }
}