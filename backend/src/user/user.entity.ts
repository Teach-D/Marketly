import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Role } from '../common/enums/role.enum';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string | null;
}
