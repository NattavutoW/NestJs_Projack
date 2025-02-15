import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import {IsNumber,IsString,IsOptional} from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsNumber()
    prcode: number;
    @IsString()
    @IsOptional()
    pr_name: string;
    @IsNumber() 
    @IsOptional()
    price: number;
}
