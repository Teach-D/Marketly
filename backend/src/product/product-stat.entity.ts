import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity('product_stat')
export class ProductStat {
  @PrimaryColumn({ name: 'product_id' })
  productId: string;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'avg_rating', type: 'double', default: 0 })
  avgRating: number;

  @OneToOne('Product', 'stat', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: unknown;
}
