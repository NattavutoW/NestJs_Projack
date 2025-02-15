import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order,'newprojack')
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem,'newprojack')
    private readonly orderItemRepository: Repository<OrderItem>,
    
    private readonly productService: ProductService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Create Order (Head)
      const order = new Order();
      order.customerName = createOrderDto.customerName;
      order.totalAmount = 0; // We'll calculate total amount later

      const savedOrder = await queryRunner.manager.save(order);

      // Create Order Items (Detail)
      const orderItems: OrderItem[] = [];
      let totalAmount = 0;

      for (const itemDto of createOrderDto.items) {
        const prcodeNumber = Number(itemDto.prcode); 
        const product = await this.productService.findOne(prcodeNumber);
        if (!product) {
          throw new Error(`Product with prcode ${itemDto.prcode} not found`);
        }

        const orderItem = new OrderItem();
        orderItem.prcode = prcodeNumber;
        orderItem.quantity = itemDto.quantity;
        orderItem.price = product.price;
        orderItem.pr_name = product.pr_name;
        orderItem.order = savedOrder;

        orderItems.push(orderItem);

        totalAmount += product.price * itemDto.quantity;
      }

      // Save Order Items
      await queryRunner.manager.save(OrderItem, orderItems);

      // Update total amount in order
      savedOrder.totalAmount = totalAmount;
      await queryRunner.manager.save(savedOrder);

      // Commit transaction
      await queryRunner.commitTransaction();

      return savedOrder;
    } catch (error) {
      // If any error occurs, roll back the transaction
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['items'] });
  }
}
