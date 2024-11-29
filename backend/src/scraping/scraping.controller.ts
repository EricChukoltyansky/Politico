import { Controller, Get } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('scrape')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get('knesset')
  async getKnessetData() {
    const urls = [
      'https://www.knesset.gov.il/mk/heb/mkindex_current.asp?view=0',
      'https://www.knesset.gov.il/mk/heb/mkindex_current.asp?view=1',
    ];
    return this.scrapingService.scrapeMultiplePages(urls);
  }
}
