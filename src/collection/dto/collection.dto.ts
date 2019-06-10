import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';
import { CollectionEntity } from '../collection.entity';

@Exclude()
export class CreateCollectionDot implements Partial<CollectionEntity> {

  @IsString()
  @Expose()
  public name!: string;

  @IsString()
  @Expose()
  public bio!: string;

  @IsBoolean()
  @Expose()
  public isPrivate!: boolean;
}
