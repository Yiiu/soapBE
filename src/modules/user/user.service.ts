import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { validator } from '@server/common/utils/validator';
import { GetPictureListDto } from '@server/modules/picture/dto/picture.dto';
import { PictureService } from '@server/modules/picture/picture.service';
import { EmailService } from '@server/shared/email/email.service';
import { LoggingService } from '@server/shared/logging/logging.service';
import { plainToClass } from 'class-transformer';
import { CreateUserDto, UpdateProfileSettingDto } from './dto/user.dto';
import { UserEntity } from './user.entity';
import { Role } from './enum/role.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly logger: LoggingService,
    @Inject(forwardRef(() => PictureService))
    private readonly pictureService: PictureService,
    private readonly emailService: EmailService,
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
  ) {}

  public async createUser(data: CreateUserDto & Partial<UserEntity>): Promise<UserEntity> {
    const { salt, hash } = await this.getPassword(data.password);
    const user = await this.userEntity.save(
      this.userEntity.create({
        salt,
        hash,
        ...data,
        username: data.username,
        email: data.email,
      }),
    );
    return user;
  }

  public async getPassword(password: string) {
    const salt = await crypto.randomBytes(32).toString('hex');
    const hash = await crypto.pbkdf2Sync(password, salt, 20, 32, 'sha512').toString('hex');
    return {
      salt,
      hash,
    };
  }

  public async isSignup(username: string, email: string, err = true) {
    const [nameData, userData] = await Promise.all([
      this.userEntity.findOne({ username }),
      this.userEntity.findOne({ email }),
    ]);
    if (nameData) {
      if (err) {
        throw new BadRequestException('Username already exists');
      }
      return 'username';
    }
    if (userData) {
      if (err) {
        throw new BadRequestException('Email already exists');
      }
      return 'email';
    }
    return false;
  }

  public async signup(data: CreateUserDto, isEmail: boolean = true) {
    const info: MutablePartial<UserEntity> = {};
    if (isEmail) {
      info.identifier = data.email;
      info.verificationToken = Math.random().toString(35).substr(2, 6);
    }
    const userInfo = await this.createUser({
      ...data,
      ...info,
    });
    // 发送email验证邮件
    if (isEmail) {
      try {
        await this.emailService.sendSignupEmail(info.identifier!, info.verificationToken!, userInfo);
      } catch (err) {
        this.logger.error(err);
        throw new BadRequestException('Email failed to send');
      }
    }
    return {
      message: 'Email is send',
    };
  }

  /**
   * 查询出用户的一些必要数据： `pictureCount`, `likes`
   *
   * @param {SelectQueryBuilder<UserEntity>} q
   * @returns
   * @memberof UserService
   */
  public selectInfo<E>(q: SelectQueryBuilder<E>, value: string = 'user') {
    return q.loadRelationCountAndMap(
      `${value}.pictureCount`, `${value}.pictures`,
    )
      .loadRelationCountAndMap(
        `${value}.likes`, `${value}.pictureActivitys`, 'activity',
        qb => qb.andWhere(
          'activity.like=TRUE',
        ),
      );
  }

  public async verifyUser(username: string, password: string): Promise<UserEntity | undefined> {
    const user = await this.getUser(username, true, [Role.ADMIN]);
    if (user) {
      const hash = await crypto.pbkdf2Sync(password, user.salt, 20, 32, 'sha512').toString('hex');
      if (hash !== user.hash) {
        return undefined;
      }
      if (!user.isVerified()) {
        throw new UnauthorizedException('Email is not activated');
      }
      return user;
    }
    return undefined;
  }

  public async getUser(query: string, user: Maybe<UserEntity> | boolean, groups?: string[]): Promise<UserEntity> {
    const q = this.userEntity.createQueryBuilder('user');
    this.selectInfo<UserEntity>(q);
    const isId = validator.isNumberString(query) || validator.isNumber(query);
    if (isId) {
      q.where('user.id=:id', { id: query });
    } else {
      q.where('user.username=:username', { username: query });
    }
    const data = await q.cache(100).getOne();
    return plainToClass(UserEntity, data, {
      groups,
    });
  }

  public async getUserPicture(idOrName: string, query: GetPictureListDto, user: Maybe<UserEntity>) {
    return this.pictureService.getUserPicture(idOrName, query, user);
  }

  public async getUserLikePicture(idOrName: string, query: GetPictureListDto, user: Maybe<UserEntity>) {
    return this.pictureService.getUserLikePicture(idOrName, query, user);
  }

  public async updateUser(user: UserEntity, body: Partial<UserEntity>, groups?: string[]) {
    const data = await this.userEntity.save(
      this.userEntity.merge(
        user,
        body,
      ),
    );
    return plainToClass(UserEntity, data, {
      groups,
    });
  }

  public async updateUserProfile(user: UserEntity, body: UpdateProfileSettingDto, avatar?: string, groups?: string[]) {
    const data = await this.userEntity.save(
      this.userEntity.merge(
        user,
        body,
        avatar ? { avatar } : {},
      ),
    );
    return plainToClass(UserEntity, data, {
      groups,
    });
  }
}