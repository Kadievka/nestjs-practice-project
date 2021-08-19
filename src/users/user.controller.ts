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
import { registerSchema } from './schemas/register.schema';
import { JoiValidationPipe } from '../pipes/joi.validation.pipe';
import { loginSchema } from './schemas/login.schema';
import { emailSchema } from './schemas/email.schema';
import { profileSchema } from './schemas/profile.schema';
import { profilePhotoSchema } from './schemas/profilePhoto.schema';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EmailDto } from './dtos/email.dto';
import { ProfileDto } from './dtos/profile.dto';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ResetPasswordDto } from './dtos/resetPassword.dto';
import resetPasswordSchema from './schemas/resetPassword.schema';
import { User } from './user.model';
import { PaginateResult } from 'mongoose';
import userErrors from './user.errors';
import { Image } from 'src/images/image.model';

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

  @Get('/get-random-user')
  @ApiOperation({
    summary: "Returns one fake user, you don't need to login",
  })
  @ApiResponse({
    status: 200,
    description: 'Returns one fake user',
    schema: {
      properties: {
        id: { default: '1' },
        firstName: { default: 'Paul' },
        lastName: { default: 'Thompson' },
        email: { default: 'roger_await415@uno.com' },
        password: { default: '22309215.cyan!279' },
      },
    },
  })
  getRandomUser() {
    return this.userService.getRandomUser();
  }

  @Get('/get-random-users')
  @ApiOperation({
    summary: "Returns a list of radom fake users, you don't need to login",
  })
  @ApiResponse({
    status: 200,
    description: 'Returns array of fake users',
    schema: {
      type: 'array',
      items: {
        example: {
          id: '1',
          firstName: 'Paul',
          lastName: 'Thompson',
          email: 'roger_await415@uno.com',
          password: '22309215.cyan!279',
        },
      },
    },
  })
  @ApiQuery({
    name: 'numberOfUsers',
    required: false,
    example: '10',
  })
  getRandomUsers(@Query('numberOfUsers') numberOfUsers: string): User[] {
    return this.userService.getRandomUsers(numberOfUsers);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Return Json Web Token after login' })
  @ApiResponse({
    status: 201,
    description: 'Returns email, isAdmin and jwt',
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
        nickNAme: { default: 'wickjb12' },
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
        nickname: { default: 'wickjb12' },
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
    nickname: string;
    lastName: string;
    firstName: string;
    cellphone: string;
    address: string;
    profilePhotoId: string;
    profilePhotoName: string;
    profilePhotoType: string;
    profilePhotoSize: number;
    profilePhotoPath: string;
  }> {
    return this.userService.getUserProfile(req.user.email);
  }

  @Post('/profile-photo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Uploads an user profile photo' })
  @ApiResponse({
    status: 201,
    description: 'Returns the successful created profilePhoto',
    schema: {
      properties: {
        email: { default: 'example@email.com' },
        nickname: { default: 'example' },
        isAdmin: { default: false },
        lastName: { default: 'Lastname' },
        firstName: { default: 'Firstname' },
        cellphone: { default: '12345678' },
        address: { default: 'example 12 example 34 example 56' },
        profilePhotoId: { default: '611ead0aeade9d56e0748739' },
        profilePhotoName: { default: 'example.jpg' },
        profilePhotoType: { default: 'image/jpeg' },
        profilePhotoSize: { default: 242002 },
        profilePhotoPath: { default: '/uploads/USERS/RFuzivawUzTUhTk.jpeg' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Returns Unauthorized when jwt in header is undefined',
    schema: {
      properties: {
        statusCode: { default: 401 },
        message: { default: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Returns forbidden when authentication jwt is incorrect',
    schema: {
      properties: {
        statusCode: { default: 403 },
        error: { default: 'Forbidden' },
      },
    },
  })
  @ApiBody({
    schema: {
      properties: {
        name: { default: 'example.jpg' },
        type: { default: 'image/jpeg' },
        size: { default: 27875 },
        file: {
          default:
            '"data:image/png;base64,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"',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(profilePhotoSchema))
  uploadProfilePhoto(@Req() req, @Body() body: Image) {
    return this.userService.uploadProfilePhoto(req.user.email, body);
  }

  @Get('/manage-get-all')
  @ApiOperation({
    summary:
      'If user isAdmin, returns all actual users, but if user is not admin, returns fake users',
  })
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
    description: 'Returns forbidden when user email is incorrect',
    schema: {
      properties: {
        statusCode: { default: 403 },
        message: { default: 'You are not allow to do this operation' },
        error: { default: 'Forbidden' },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getAllUsersToManage(@Req() req): Promise<User[]> {
    return this.userService.getAllUsersToManage(req.user.email);
  }

  @Get('/manage-get-banned')
  @ApiOperation({ summary: 'Returns only banned users paginated' })
  @ApiResponse({
    status: 200,
    description: 'Returns successful information',
    schema: {
      properties: {
        docs: {
          default: [
            {
              isAdmin: false,
              isBanned: true,
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
  getBannedUsersToManage(
    @Req() req,
    @Query('page') page: string,
  ): Promise<PaginateResult<User>> {
    return this.userService.getBannedUsersToManage(req.user.email, page);
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
    description: 'Returns forbidden when user to ban is already banned',
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

  @Put('/manage-remove-ban/:userEmail')
  @ApiParam({
    name: 'userEmail',
    example: 'example1@mail.com',
  })
  @ApiOperation({
    summary: 'Admin user can remove the ban in another not admin user',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns removed ban user email',
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
    description: 'Returns forbidden when user to remove ban in not banned',
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
  removeBan(
    @Req() req,
    @Param('userEmail') userEmail: string,
  ): Promise<EmailDto> {
    return this.userService.removeBan(req.user.email, userEmail);
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
