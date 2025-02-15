import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import * as json2csv from 'json-2-csv';  // ✅ นำเข้าแบบทั้งก้อน
import { Response } from 'express';
import { promisify } from 'util';  // ✅ ใช้ promisify แปลงให้เป็น async function

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product, 'newprojack')
    private productRepository: Repository<Product>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.productRepository.save(createProductDto);
  }

  async findAll() {
    const cacheKey = 'productsAll';
    const cacheProduct = await this.cacheManager.get<Product[]>(cacheKey);
    if (cacheProduct) {
      console.log('Serving from cache');
      return cacheProduct;
    }
    const products = await this.productRepository.find();
    await this.cacheManager.set(cacheKey, products, 10);
    return products;
  }

  async findOne(prcode: number) {
    // ตรวจสอบว่า prcode เป็นตัวเลขที่ถูกต้อง
    if (isNaN(prcode)) {
      throw new Error('Invalid prcode');
    }

    const cacheKey = `product_${prcode}`;
    const cacheProduct = await this.cacheManager.get<Product>(cacheKey);
    if (cacheProduct) {
      console.log('Serving from cache');
      return cacheProduct;
    }
    console.log('Serving from database');
    const product = await this.productRepository.findOne({ where: { prcode } });
    if (product) {
      await this.cacheManager.set(cacheKey, product, 10);
    }
    return product;
  }


  async update(prcode: number, updateProductDto: UpdateProductDto) {
    if (!prcode || !updateProductDto) {
      throw new Error('prcode or update data is missing');
    }

    const result = await this.productRepository.update({ prcode }, updateProductDto);

    if (result.affected === 0) {
      throw new NotFoundException('Product not found');
    }

    const cacheKey = `product_${prcode}`;
    const updatedProduct = await this.productRepository.findOne({ where: { prcode } });
    if (updatedProduct) {
      await this.cacheManager.set(cacheKey, updatedProduct, 10);
    }

    return updatedProduct;
  }

  async remove(prcode: number) {
    const result = await this.productRepository.delete(prcode);
    if (result.affected === 0) {
      throw new NotFoundException('Product not found');
    }

    const cacheKey = `product_${prcode}`;
    await this.cacheManager.del(cacheKey);
    return { message: 'Product deleted successfully' };
  }

  async exportToCSV(res: Response): Promise<void> {
    try {
      console.log("Starting to export CSV");

      const products = await this.productRepository.find();

      const json2csvAsync = promisify(json2csv.json2csv);

      const csv = await json2csvAsync(products, {});


      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=products.csv');

      res.end(csv);
      console.log("CSV sent to client");

    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ message: 'Error exporting CSV' });
    }
  }



}
