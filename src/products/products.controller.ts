import {
  Body,
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async addProduct(
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('price') price: number,
  ): Promise<{ id: string }> {
    const generatedId = await this.productsService.insertProduct(
      title,
      description,
      price,
    );
    return {
      id: generatedId,
    };
  }

  @Get()
  getAllProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('price') price: number,
  ) {
    return this.productsService.updateProduct(id, title, description, price);
  }

  @Delete(':id')
  removeProduct(@Param('id') id: string) {
    return this.productsService.removeProductById(id);
  }
}
