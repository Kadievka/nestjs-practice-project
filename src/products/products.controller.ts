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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import productSchema from './product.schema';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Adds one product and returns generated id' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      properties: {
        title: {
          type: 'string',
          default: 'Product Title',
        },
        description: {
          type: 'string',
          default: 'Product description',
        },
        price: {
          type: 'number',
          default: 48.99,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Returns the generated prodcut id',
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
  })
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
  @ApiOperation({ summary: 'Returns all products of one user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns an array of products created by authorized user',
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
  })
  @UseGuards(JwtAuthGuard)
  getAllProductsByUser(@Req() req): Promise<
    {
      id: string;
      title: string;
      description: string;
      price: number;
    }[]
  > {
    return this.productsService.getProductsByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns one product detail' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'the id of the product',
    required: true,
    example: '60f70138d433b7396cead2d5',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns one product details created by authorized user',
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
  })
  @ApiResponse({
    status: 404,
    description: 'Returns Not Found Error when the product does no exists',
  })
  getProduct(@Param('id') id: string): Promise<{
    id: string;
    title: string;
    description: string;
    price: number;
  }> {
    return this.productsService.getProductById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates one product and returns product detail' })
  @ApiParam({
    name: 'id',
    description: 'the id of the product',
    required: true,
    example: '60f70138d433b7396cead2d5',
  })
  @ApiBody({
    schema: {
      properties: {
        title: {
          type: 'string',
          default: 'Updated Product Title',
        },
        description: {
          type: 'string',
          default: 'Updated Product description',
        },
        price: {
          type: 'number',
          default: 99.99,
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns one product details updated by authorized user',
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
  })
  @ApiResponse({
    status: 404,
    description: 'Returns Not Found Error when the product does no exists',
  })
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
  @ApiOperation({ summary: 'Adds one product and returns generated id' })
  @ApiParam({
    name: 'id',
    description: 'the id of the product',
    required: true,
    example: '60f70138d433b7396cead2d5',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns the id of the product deleted by authorized user',
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Returns forbidden when the product does not belong to user',
  })
  @ApiResponse({
    status: 404,
    description: 'Returns Not Found Error when the product does no exists',
  })
  @UseGuards(JwtAuthGuard)
  removeProduct(@Param('id') id: string, @Req() req): Promise<{ id: string }> {
    return this.productsService.removeProductById(id, req.user.id);
  }
}
