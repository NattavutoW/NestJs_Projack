import { IsNotEmpty, IsArray } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  customerName: string;

  @IsArray()
  items: { prcode: string; quantity: number }[];
}
