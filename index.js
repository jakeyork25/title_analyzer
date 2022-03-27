import puppeteerExtra from 'puppeteer-extra';
import stealthPluggin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer';

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

const throwawayWordArray = ['the', 'and', 'in', 'that', 'so', 'a', 'an', 'in', 'on', 'to', 'of'];

const GetAnalysis = async () => {
    puppeteerExtra.use(stealthPluggin());
    const browser = await puppeteerExtra.launch({ headless: false });
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    const searchTerm = "christmas";
    
    await page.goto("https://www.youtube.com/");
    const searchBar = await page.$('input[id="search"]');
    const searchButton = await page.$('button[id="search-icon-legacy"]');
    await searchBar.type(searchTerm);
    await searchButton.click();

    await page.waitForTimeout(2000);
    await page.waitForSelector('yt-formatted-string[class="style-scope ytd-video-renderer"]');

    for(let i = 0; i < 5; i++) {
        await page.evaluate( () => {
            window.scrollBy(0, window.innerHeight * 5);
        });
        await page.waitForTimeout(5000);
    }

    const videoArrayLength = (await page.$x('//a[@id="video-title"]/yt-formatted-string')).length;
    const videoArray = await page.$x('//a[@id="video-title"]/yt-formatted-string');
    console.log("Array Length: " + videoArrayLength);

    const wordArray = [];

    for(let i = 0; i < videoArrayLength; i++) {
        const element = videoArray[i];
        let text = await page.evaluate(el => el.textContent, element);
        text = CleanString(text);
        var splitTitleArray = text.split(' ');

        splitTitleArray.forEach(word => {
            wordArray.push(word);
        });
    }

    wordArray.forEach((word, index) => {
        var lastChar = word.slice(-1);
        if(lastChar === "s") {
            var singularVersion = word.slice(0, word.length - 1);
            if(!wordArray.includes(singularVersion)) return;
            wordArray[index] = singularVersion;
        }
    });

    var count = {};
    wordArray.forEach((word) => { 
        var search = searchTerm.toLowerCase();
        if(!throwawayWordArray.includes(word) && !search.includes(word)) {
            { count[word] = (count[word]||0) + 1; }
        }
    });

    let placeList = ["", "", "", "", ""];

    let maxList = [0, 0, 0, 0, 0];

    Object.entries(count).forEach(([key, value]) => {
        for(var ind = 0; ind < 5; ind++) {
            if(value > maxList[ind]) {
                if(ind < 4 && maxList[ind] > maxList[ind + 1]) {
                    placeList[ind + 1] = placeList[ind];
                    maxList[ind + 1] = maxList[ind];
                }
                placeList[ind] = key;
                maxList[ind] = value;
                return;
            }
        }

    });

    for(var j = 0; j < 5; j++) {
        console.log("Number " + (j + 1) + " is " + placeList[j] + " at " + maxList[j]);
    }

    //await browser.close();
}

GetAnalysis();