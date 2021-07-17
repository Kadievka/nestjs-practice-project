import {
  Body,
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { Product } from './product.model';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async addProduct(
    @Body() body: { title: string; description: string; price: number },
  ): Promise<{ id: string }> {
    const generatedId = await this.productsService.insertProduct(body);
    return {
      id: generatedId,
    };
  }

  @Get()
  getAllProducts(): Promise<Product[]> {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProduct(@Param('id') id: string): Promise<Product> {
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
  ): Promise<Product> {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  removeProduct(@Param('id') id: string): Promise<{ id: string }> {
    return this.productsService.removeProductById(id);
  }
}
