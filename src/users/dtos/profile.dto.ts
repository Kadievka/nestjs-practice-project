import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({
    type: String,
    description: 'user first name',
    default: 'John',
  })
  firstName: string;

  @ApiProperty({
    type: String,
    description: 'user last name',
    default: 'Wick',
  })
  lastName: string;

  @ApiProperty({
    type: String,
    description: 'user cellphone number',
    default: '+1 800 20 32',
  })
  cellphone: string;

  @ApiProperty({
    type: String,
    description: 'user address description',
    default: 'street 21, 1. DF Utah',
  })
  address: string;
}
