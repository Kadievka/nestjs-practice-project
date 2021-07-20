import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    type: String,
    description: 'Product title',
    default: 'Updated product title',
  })
  title: string;

  @ApiProperty({
    type: String,
    description: 'Product description',
    default: 'Updated product description',
  })
  description: string;

  @ApiProperty({
    type: Number,
    description: 'Product price',
    default: 100.999,
  })
  price: number;
}
