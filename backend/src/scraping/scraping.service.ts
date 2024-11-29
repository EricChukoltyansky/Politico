import { Injectable } from '@nestjs/common';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

@Injectable()
export class ScrapingService {
  async scrapePage(url: string): Promise<any> {
    let driver: WebDriver;
    try {
      const options = new chrome.Options();
      options.addArguments('--headless'); // Enable headless mode

      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

      await driver.get(url);
      await driver.wait(until.elementLocated(By.css('.member-row')), 10000);

      const members = await driver.findElements(By.css('.member-row'));
      const results = [];
      for (const member of members) {
        const name = await member.findElement(By.css('.mk-name')).getText();
        const role = await member.findElement(By.css('.mk-position')).getText();
        const party = await member.findElement(By.css('.mk-party')).getText();
        results.push({ name, role, party });
      }

      return results;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      throw new Error(`Failed to scrape ${url}`);
    } finally {
      if (driver) {
        await driver.quit();
      }
    }
  }

  async scrapeMultiplePages(urls: string[]): Promise<any[]> {
    const results = await Promise.all(
      urls.map((url) =>
        this.scrapePage(url).catch((error) => ({ url, error: error.message })),
      ),
    );
    return results;
  }
}
