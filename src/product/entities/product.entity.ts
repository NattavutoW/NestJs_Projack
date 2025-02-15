import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  prcode: number;

  @Column()
  pr_name: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column({ default: true })
  isActive: boolean;
}
