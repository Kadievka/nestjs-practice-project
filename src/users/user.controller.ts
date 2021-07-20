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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmailDto } from './email.dto';
import { ProfileDto } from './profile.dto';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { ResetPasswordDto } from './resetPassword.dto';
import resetPasswordSchema from './resetPassword.schema';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Creates one user with email and password' })
  @ApiResponse({
    status: 201,
    description: 'Returns the successful created email',
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
  })
  @UsePipes(new JoiValidationPipe(registerSchema))
  registerUser(@Body() user: RegisterDto): Promise<{ email: string }> {
    return this.userService.registerUser(user);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Return Json Web Token after login' })
  @ApiResponse({
    status: 201,
    description: 'Returns email and jwt',
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
  })
  @ApiResponse({
    status: 403,
    description: 'Returns forbidden when password or email are incorrect',
  })
  @UsePipes(new JoiValidationPipe(loginSchema))
  login(@Body() user: LoginDto) {
    return this.userService.login(user);
  }

  @Post('/reset-password')
  @ApiOperation({
    summary: 'Reset password and return Json Web Token to set new password',
  })
  @ApiResponse({
    status: 201,
    description: 'Returns email and jwt',
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
  })
  @ApiResponse({
    status: 403,
    description: 'Returns forbidden when email is incorrect',
  })
  @UsePipes(new JoiValidationPipe(emailSchema))
  sendJwtToResetPassword(@Body() user: EmailDto) {
    return this.userService.sendJwtToResetPassword(user.email);
  }

  @Put('/update-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sets new password' })
  @ApiResponse({
    status: 200,
    description: 'Returns email when update password was successful',
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
    status: 403,
    description: 'Returns forbidden when password is not empty',
  })
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(resetPasswordSchema))
  updatePassword(@Body() passwordRequest: ResetPasswordDto, @Req() req) {
    return this.userService.updatePassword(passwordRequest, req.user.email);
  }

  @Put('/update-profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the profile information about the user' })
  @ApiResponse({
    status: 200,
    description: 'Returns profile information',
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
  })
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(profileSchema))
  updateProfile(
    @Req() req,
    @Body()
    profile: ProfileDto,
  ) {
    return this.userService.updateProfile(req.user.email, profile);
  }
}
