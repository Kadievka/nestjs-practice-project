import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { UsersService } from './user.service';
import userSchema from './user.schema';
import { JoiValidationPipe } from '../joi.validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(userSchema))
  registerUser(
    @Body() user: { email: string; password: string },
  ): Promise<{ email: string }> {
    return this.userService.registerUser(user);
  }

  @Post('/login')
  @UsePipes(new JoiValidationPipe(userSchema))
  login(@Body() user: { email: string; password: string }) {
    return this.userService.login(user);
  }
}
