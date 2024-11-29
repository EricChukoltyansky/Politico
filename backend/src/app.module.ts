import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrapingModule } from './scraping/scraping.module';
import { ScrapingService } from './scraping/scraping.service';
import { ScrapingController } from './scraping/scraping.controller';

@Module({
  imports: [ScrapingModule],
  controllers: [AppController, ScrapingController],
  providers: [AppService, ScrapingService],
})
export class AppModule {}
