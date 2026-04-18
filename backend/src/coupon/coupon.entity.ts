import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('coupon')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'discount_rate', type: 'double' })
  discountRate: number;

  @Column({ name: 'min_order_amount', default: 0 })
  minOrderAmount: number;

  @Column({ name: 'max_issue_count' })
  maxIssueCount: number;

  @Column({ name: 'issued_count', default: 0 })
  issuedCount: number;

  @Column({ name: 'open_at' })
  openAt: Date;

  @Column({ name: 'valid_from' })
  validFrom: Date;

  @Column({ name: 'valid_until' })
  validUntil: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('UserCoupon', 'coupon', { lazy: true })
  userCoupons: Promise<unknown[]>;

  @OneToMany('Order', 'coupon', { lazy: true })
  orders: Promise<unknown[]>;
}
