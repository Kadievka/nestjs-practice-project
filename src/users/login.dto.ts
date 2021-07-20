import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    type: String,
    description: 'some unique email',
    default: 'example@email.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: 'some secure password',
    minLength: 8,
    default: '12345678',
  })
  password: string;
}
