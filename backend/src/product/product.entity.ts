import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ fulltext: true })
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({ type: 'double' })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'sales_count', default: 0 })
  salesCount: number;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('OrderItem', 'product', { lazy: true })
  orderItems: Promise<unknown[]>;

  @OneToMany('Review', 'product', { lazy: true })
  reviews: Promise<unknown[]>;

  @OneToOne('ProductStat', 'product', { lazy: true })
  stat: Promise<unknown>;
}
