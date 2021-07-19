import { JoiValidationPipe } from './../joi.validation.pipe';
import {
  Body,
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Patch,
  UsePipes,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import productSchema from './product.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(productSchema))
  async addProduct(
    @Body() body: { title: string; description: string; price: number },
  ): Promise<{ id: string }> {
    const generatedId = await this.productsService.insertProduct(body);
    return {
      id: generatedId,
    };
  }

  @Get()
  getAllProducts(): Promise<
    {
      id: string;
      title: string;
      description: string;
      price: number;
    }[]
  > {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProduct(@Param('id') id: string): Promise<{
    id: string;
    title: string;
    description: string;
    price: number;
  }> {
    return this.productsService.getProductById(id);
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body()
    body: {
      title: string;
      description: string;
      price: number;
    },
  ): Promise<{
    id: string;
    title: string;
    description: string;
    price: number;
  }> {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  removeProduct(@Param('id') id: string): Promise<{ id: string }> {
    return this.productsService.removeProductById(id);
  }
}
