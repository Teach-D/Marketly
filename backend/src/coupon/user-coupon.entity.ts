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

  @Column({ name: 'used_at', type: 'datetime', nullable: true, default: null })
  usedAt: Date | null;

  @Column({ name: 'order_id', nullable: true, unique: true, default: null })
  orderId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('User', 'userCoupons', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: unknown;

  @ManyToOne('Coupon', 'userCoupons', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: unknown;

  @OneToOne('Order', 'userCoupon', { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: unknown;
}
