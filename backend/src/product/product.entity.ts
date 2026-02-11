import { Column, DeleteDateColumn, Entity } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity()
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
