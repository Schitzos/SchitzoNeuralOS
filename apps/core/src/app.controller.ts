import { Controller, Get } from '@nestjs/common';
import { Public } from './public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'schitzo-core', timestamp: new Date().toISOString() };
  }
}
