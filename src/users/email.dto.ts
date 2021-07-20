import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @ApiProperty({
    type: String,
    description: 'some unique email',
    default: 'example@email.com',
  })
  email: string;
}
