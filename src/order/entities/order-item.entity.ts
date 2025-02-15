import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';  // อ้างอิง Order
import { Product } from '../../product/entities/product.entity';  // อ้างอิง Product ที่เราสร้างไว้แล้ว

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prcode: number;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  pr_name: string;

  // Many-to-One Relationship ระหว่าง OrderItem กับ Order
  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  // Many-to-One Relationship ระหว่าง OrderItem กับ Product
  @ManyToOne(() => Product, (product) => product.prcode)
  product: Product;
}
