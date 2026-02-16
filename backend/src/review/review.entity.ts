import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { UserEntity } from '../user/user.entity';
import { Product } from '../product/product.entity';

@Entity()
@Unique(['userId', 'productId'])
export class Review extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text' })
  content: string;
}
