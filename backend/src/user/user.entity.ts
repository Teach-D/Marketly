import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ name: 'refresh_token', type: 'text', nullable: true, default: null })
  refreshToken: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('Order', 'user', { lazy: true })
  orders: Promise<unknown[]>;

  @OneToMany('Review', 'user', { lazy: true })
  reviews: Promise<unknown[]>;

  @OneToMany('UserCoupon', 'user', { lazy: true })
  userCoupons: Promise<unknown[]>;
}
