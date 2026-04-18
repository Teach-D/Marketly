import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('user_coupon')
@Unique(['userId', 'couponId'])
export class UserCoupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'coupon_id' })
  couponId: string;

  @Column({ name: 'used_at', nullable: true, default: null })
  usedAt: Date | null;

  @Column({ name: 'order_id', nullable: true, unique: true, default: null })
  orderId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('User', 'userCoupons', { lazy: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Promise<unknown>;

  @ManyToOne('Coupon', 'userCoupons', { lazy: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Promise<unknown>;

  @OneToOne('Order', 'userCoupon', { lazy: true, nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Promise<unknown>;
}
