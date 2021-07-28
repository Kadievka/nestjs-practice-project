import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { registerSchema } from './register.schema';
import { JoiValidationPipe } from '../pipes/joi.validation.pipe';
import { loginSchema } from './login.schema';
import { emailSchema } from './email.schema';
import { profileSchema } from './profile.schema';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { EmailDto } from './email.dto';
import { ProfileDto } from './profile.dto';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { ResetPasswordDto } from './resetPassword.dto';
import resetPasswordSchema from './resetPassword.schema';
import { User } from './user.model';
import { PaginateResult } from 'mongoose';
import userErrors from './user.errors';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Creates one user with email and password' })
  @ApiResponse({
    status: 201,
    description: 'Returns the successful created email',
    schema: {
      properties: {
        email: { default: 'example@email.com' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
    schema: {
      properties: {
        statusCode: { default: 400 },
        message: { default: '"confirmPassword" must be [ref:password]' },
        error: { default: 'Bad Request' },
      },
    },
  })
  @UsePipes(new JoiValidationPipe(registerSchema))
  registerUser(@Body() user: RegisterDto): Promise<EmailDto> {
    return this.userService.registerUser(user);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Return Json Web Token after login' })
  @ApiResponse({
    status: 201,
    description: 'Returns email and jwt',
    schema: {
      properties: {
        email: { default: 'example@email.com' },
        jwt: {
          default:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4YW1wbGVAZW1haWwuY29tIiwic3ViIjoiNjBmZWU0MDI1MmIzZTEzMGI0ZDc4Yzk4IiwiaWF0IjoxNjI3MzE5NTkwfQ.U_1nYXAzauiCibtcEhOeUiGB6rTVHyandnu9m3ALTN0',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
    schema: {
      properties: {
        statusCode: { default: 400 },
        message: { default: '"email" must be a valid email' },
        error: { default: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Returns forbidden when password or email are incorrect, or the user is banned',
    schema: {
      properties: {
        statusCode: { default: 403 },
        message: { default: userErrors.ALREADY_BANNED },
        error: { default: 'Forbidden' },
      },
    },
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
    schema: {
      properties: {
        email: { default: 'example@email.com' },
        jwt: {
          default:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4YW1wbGVAZW1haWwuY29tIiwic3ViIjoiNjBmZWU0MDI1MmIzZTEzMGI0ZDc4Yzk4IiwiaWF0IjoxNjI3MzE5NTkwfQ.U_1nYXAzauiCibtcEhOeUiGB6rTVHyandnu9m3ALTN0',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
    schema: {
      properties: {
        statusCode: { default: 400 },
        message: { default: '"email" must be a valid email' },
        error: { default: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Returns forbidden when email is incorrect',
    schema: {
      properties: {
        statusCode: { default: 403 },
        message: { default: 'Forbidden' },
      },
    },
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
    schema: {
      properties: {
        email: { default: 'example@email.com' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
    schema: {
      properties: {
        statusCode: { default: 400 },
        message: { default: '"email" must be a valid email' },
        error: { default: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
    schema: {
      properties: {
        statusCode: { default: 401 },
        message: { default: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Returns forbidden when password is not empty',
    schema: {
      properties: {
        statusCode: { default: 403 },
        message: { default: 'Forbidden' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(resetPasswordSchema))
  updatePassword(@Body() passwordRequest: ResetPasswordDto, @Req() req) {
    return this.userService.updatePassword(passwordRequest, req.user.email);
  }

  @Put('/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the profile information about the user' })
  @ApiResponse({
    status: 200,
    description: 'Returns profile information',
    schema: {
      properties: {
        lastName: { default: 'Wick' },
        firstName: { default: 'John' },
        cellphone: { default: '+1 800 20 32' },
        address: { default: 'street 21, 1. DF Utah' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Returns some message that validation failed',
    schema: {
      properties: {
        statusCode: { default: 400 },
        message: { default: '"firstName" must be a string' },
        error: { default: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
    schema: {
      properties: {
        statusCode: { default: 401 },
        message: { default: 'Unauthorized' },
      },
    },
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

  @Get('/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Returns the profile information about the user' })
  @ApiResponse({
    status: 200,
    description: 'Returns profile information',
    schema: {
      properties: {
        email: { default: 'example@email.com' },
        isAdmin: { default: false },
        lastName: { default: 'Wick' },
        firstName: { default: 'John' },
        cellphone: { default: '+1 800 20 32' },
        address: { default: 'street 21, 1. DF Utah' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
    schema: {
      properties: {
        statusCode: { default: 401 },
        message: { default: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Returns forbidden when user email is incorrect',
    schema: {
      properties: {
        statusCode: { default: 403 },
        message: { default: 'Forbidden' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req): Promise<{
    email: string;
    lastName: string;
    firstName: string;
    cellphone: string;
    address: string;
  }> {
    return this.userService.getUserProfile(req.user.email);
  }

  @Get('/manage')
  @ApiOperation({ summary: 'Returns an array of all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns successful information',
    schema: {
      properties: {
        docs: {
          default: [
            {
              isAdmin: false,
              isBanned: false,
              _id: '60fee40252b3e130b4d78c98',
              email: 'example@email.com',
              createdAt: '2021-07-26T16:34:10.228Z',
              updatedAt: '2021-07-26T17:23:32.398Z',
            },
          ],
        },
        total: { default: 1 },
        limit: { default: 10 },
        page: { default: 1 },
        pages: { default: 1 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
    schema: {
      properties: {
        statusCode: { default: 401 },
        message: { default: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Returns forbidden when user email is incorrect or user is not admin',
    schema: {
      properties: {
        statusCode: { default: 403 },
        message: { default: 'You are not allow to do this operation' },
        error: { default: 'Forbidden' },
      },
    },
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    example: '1',
  })
  @UseGuards(JwtAuthGuard)
  getAllUsersToManage(
    @Req() req,
    @Query('page') page,
  ): Promise<PaginateResult<User>> {
    return this.userService.getAllUsersToManage(req.user.email, page);
  }

  @Put('/manage-ban/:userEmail')
  @ApiParam({
    name: 'userEmail',
    example: 'example1@mail.com',
  })
  @ApiOperation({ summary: 'Admin user can ban another not admin user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns banned user email',
    schema: {
      properties: {
        email: { default: 'example1@mail.com' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
    schema: {
      properties: {
        statusCode: { default: 401 },
        message: { default: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Returns forbidden when user to ban is admin or is already banned',
    schema: {
      properties: {
        statusCode: { default: 403 },
        message: { default: userErrors.ALREADY_BANNED },
        error: { default: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Returns not found exception',
    schema: {
      properties: {
        statusCode: { default: 404 },
        message: { default: 'Not Found' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  banUser(
    @Req() req,
    @Param('userEmail') userEmail: string,
  ): Promise<EmailDto> {
    return this.userService.banUser(req.user.email, userEmail);
  }

  @Delete('/manage-delete/:userEmail')
  @ApiParam({
    name: 'userEmail',
    example: 'example1@mail.com',
  })
  @ApiOperation({ summary: 'Admin user can delete another not admin user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns deleted user email',
    schema: {
      properties: {
        email: { default: 'example1@mail.com' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is invalid',
    schema: {
      properties: {
        statusCode: { default: 401 },
        message: { default: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Returns forbidden when user to delete is admin',
    schema: {
      properties: {
        statusCode: { default: 403 },
        message: { default: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Returns not found exception',
    schema: {
      properties: {
        statusCode: { default: 404 },
        message: { default: 'Not Found' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  deleteUser(
    @Req() req,
    @Param('userEmail') userEmail: string,
  ): Promise<EmailDto> {
    return this.userService.deleteUser(req.user.email, userEmail);
  }
}
