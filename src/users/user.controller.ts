import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './user.service';
import registerSchema from './register.schema';
import { JoiValidationPipe } from '../joi.validation.pipe';
import loginSchema from './login.schema';
import emailSchema from './email.schema';
import profileSchema from './profile.schema';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(registerSchema))
  registerUser(
    @Body() user: { email: string; password: string },
  ): Promise<{ email: string }> {
    return this.userService.registerUser(user);
  }

  @Post('/login')
  @UsePipes(new JoiValidationPipe(loginSchema))
  login(@Body() user: { email: string; password: string }) {
    return this.userService.login(user);
  }

  @Post('/reset-password')
  @UsePipes(new JoiValidationPipe(emailSchema))
  sendJwtToResetPassword(@Body() user: { email: string }) {
    return this.userService.sendJwtToResetPassword(user.email);
  }

  @Put('/update-password')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(registerSchema))
  updatePassword(@Body() user: { email: string; password: string }) {
    return this.userService.updatePassword(user);
  }

  @Put('/update-profile')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(profileSchema))
  updateProfile(
    @Req() req,
    @Body()
    information: {
      firstName: string;
      lastName: string;
      cellphone: string;
      address: string;
    },
  ) {
    return this.userService.updateProfile(req.user.email, information);
  }
}
