import { JoiValidationPipe } from './../joi.validation.pipe';
import {
  Body,
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  UsePipes,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import productSchema from './product.schema';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(productSchema))
  @UseGuards(JwtAuthGuard)
  async addProduct(
    @Req() req,
    @Body()
    body: { title: string; description: string; price: number; userId: string },
  ): Promise<{ id: string }> {
    const generatedId = await this.productsService.insertProduct(
      body,
      req.user.id,
    );
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
  @UseGuards(JwtAuthGuard)
  updateProduct(
    @Param('id') id: string,
    @Req() req,
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
    return this.productsService.updateProduct(id, body, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeProduct(@Param('id') id: string, @Req() req): Promise<{ id: string }> {
    return this.productsService.removeProductById(id, req.user.id);
  }
}
