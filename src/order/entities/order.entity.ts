import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';  // อ้างอิง OrderItem

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerName: string;

  @Column()
  totalAmount: number;

  // ความสัมพันธ์ one-to-many ระหว่าง Order กับ OrderItem
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];
}
