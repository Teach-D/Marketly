import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrderStatus } from './enums/order-status.enum';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PAID })
  status: OrderStatus;

  @Column({ name: 'total_price', type: 'double' })
  totalPrice: number;

  @Column({ name: 'discount_amount', type: 'double', default: 0 })
  discountAmount: number;

  @Column({ name: 'coupon_id', nullable: true, default: null })
  couponId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('User', 'orders', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: unknown;

  @ManyToOne('Coupon', 'orders', { nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon: unknown;

  @OneToMany('OrderItem', 'order')
  items: unknown[];

  @OneToOne('UserCoupon', 'order')
  userCoupon: unknown;
}
