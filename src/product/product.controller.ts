import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Res } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {AuthGuard} from '@nestjs/passport';
import { Response } from 'express';

@Controller('product')

export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Get('export')
  async export(@Res() res: Response) {
    await this.productService.exportToCSV(res);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.productService.findAll();
  }

  @Get(':prcode')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('prcode') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch()  // ไม่ใช้ ':id' ใน URL
  update(@Body() updateProductDto: UpdateProductDto) {
    const { prcode } = updateProductDto;  // ดึง prcode จาก body
    return this.productService.update(prcode, updateProductDto);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  remove(@Body() updateProductDto: UpdateProductDto) {
    const { prcode } = updateProductDto;  // ดึง prcode จาก body
    return this.productService.remove(prcode);
  }

 
}
