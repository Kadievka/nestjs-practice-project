import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    type: String,
    description: 'some secure password',
    minLength: 8,
    default: '12345678',
  })
  password: string;

  @ApiProperty({
    type: String,
    description: 'some secure password equal to password',
    minLength: 8,
    default: '12345678',
  })
  confirmPassword: string;
}
