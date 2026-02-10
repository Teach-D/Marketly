import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string | null;
}
