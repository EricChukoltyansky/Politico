import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ScrapingService } from './scraping/scraping.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly scrapingService: ScrapingService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
