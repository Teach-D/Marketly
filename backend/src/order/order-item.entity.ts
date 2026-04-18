import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'product_id', nullable: true, default: null })
  productId: string | null;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'double' })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Order', 'items', { lazy: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Promise<unknown>;

  @ManyToOne('Product', 'orderItems', { lazy: true, nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Promise<unknown>;
}
