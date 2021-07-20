import { ApiProperty } from '@nestjs/swagger';

export class AddProductDto {
  @ApiProperty({
    type: String,
    description: 'Product title',
    default: 'Product title',
  })
  title: string;

  @ApiProperty({
    type: String,
    description: 'Product description',
    default: 'Product description',
  })
  description: string;

  @ApiProperty({
    type: Number,
    description: 'Product price',
    default: 499.5,
  })
  price: number;

  userId: string;
}
