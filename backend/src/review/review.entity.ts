import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('review')
@Unique(['userId', 'productId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column()
  rating: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Product', 'reviews', { lazy: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Promise<unknown>;

  @ManyToOne('User', 'reviews', { lazy: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Promise<unknown>;
}
