import puppeteerExtra from 'puppeteer-extra';
import stealthPluggin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer';
import getPixels from 'get-pixels';
import ntc from 'name-that-color/lib/ntc.js';
import rgbHex from 'rgb-hex';

import lib from './lib.js';

const CleanString = (str) => {
    var charArray = ["/", "&", "-", "|", "!", "?", ",", ":", "\"", "(", ")", "~"];
    str = str.toLowerCase();
    charArray.forEach(char => {
        str = str.replaceAll(char, " ");
    })
    str = str.replaceAll("\'", '');
    str = str.replaceAll("   ", " ");
    str = str.replaceAll("  ", " ");
    return str;
}

const CreateBrowser = async () => {
    puppeteerExtra.use(stealthPluggin());
    return await puppeteerExtra.launch({ headless: false });
}

const CreatePage = async (browser) => {
    var page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    return page;
}

const SearchForVideos = async (page, searchTerm) => {
    await page.goto("https://www.youtube.com/");
    await page.waitForTimeout(1000);
    const searchBar = await page.$('input[id="search"]');
    const searchButton = await page.$('button[id="search-icon-legacy"]');
    await searchBar.type(searchTerm);
    await page.waitForTimeout(500);
    await searchButton.click();
    await page.waitForTimeout(2000);
    return page;
}

const LoadVideos = async (page, videoCount) => {
    await page.waitForSelector('yt-formatted-string[class="style-scope ytd-video-renderer"]');
    var scrollAmount = Math.round(videoCount / 3);
    for(let i = 0; i < scrollAmount; i++) {
        await page.evaluate( () => {
            window.scrollBy(0, window.innerHeight);
        });
        await page.waitForTimeout(3000);
    }
    return page;
}





const tossArray = ['the', 'and', 'in', 'that', 'so', 'a', 'an', 'in', 'on', 'to', 'of'];

const GetVideoData = async () => {
    const browser = await CreateBrowser();
    let page = await CreatePage(browser);
    const searchTerm = "yellow";
    const videoAmount = 30;

    await lib.GetTitleRankings()
    await lib.GetColorRankings(page);
    
    // page = await SearchForVideos(page, searchTerm);
    // page = await LoadVideos(page, videoAmount);

    // console.log("Videos have loaded!");

    // const videoArray = await ScrapeVideos(page);
    // let wordArray = await GetWordArray(page, videoArray);
    // wordArray = await CleanWordArray(wordArray);
    // const count = await CreateCountObject(wordArray, searchTerm, tossArray);
    // const titleDataArray = await GetTitleArray(count);
    // await PrintTitleData(titleDataArray);

    // await GetColors(page);

    //await browser.close();
}

