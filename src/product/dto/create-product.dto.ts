
import {  IsNumber, IsString ,IsOptional} from "class-validator";
export class CreateProductDto {
    @IsNumber()
    @IsOptional()
    readonly prcode: number;
    @IsString()
    readonly pr_name: string;
    @IsNumber() 
    readonly price: number;
}
