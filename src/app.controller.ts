import { Controller, Get, Res } from '@nestjs/common';
import welcomeTemplate from './templates/welcome';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags()
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Returns a html welcome page' })
  @ApiResponse({
    status: 200,
    description: 'Returns welcome page with success',
  })
  getHello(@Res() res): string {
    return res.send(welcomeTemplate);
  }
}
