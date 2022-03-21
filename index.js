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

const throwawayWordArray = ['the', 'and', 'in', 'that', 'so', 'a', 'an', 'in'];

const GetAnalysis = async () => {
    puppeteerExtra.use(stealthPluggin());
    const browser = await puppeteerExtra.launch({ headless: false });
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    const searchTerm = "Search Term Here";
    
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

    let first = "";
    let second = "";
    let third = "";
    let fourth = "";
    let fifth = "";

    let max1 = 0;
    let max2 = 0;
    let max3 = 0;
    let max4 = 0;
    let max5 = 0;

    for (let [key, value] of Object.entries(count)) {
        if(value > max1) { 
            if(max1 > max2) {
                second = first;
                max2 = max1;
            }
            first = key;
            max1 = value;           
        }
        else if(value > max2) { 
            if(max2 > max3) {
                third = second;
                max3 = max2;
            }
            second = key;
            max2 = value;        
        }
        else if(value > max3) { 
            if(max3 > max4) {
                fourth = third;
                max4 = max3;
            }
            third = key;
            max3 = value;        
        } else if(value > max4) { 
            if(max4 > max5) {
                fifth = fourth;
                max5 = max4;
            }
            fourth = key;
            max4 = value;        
        } else if(value > max5) {
            fifth = key;
            max5 = value;
        }
    }

    console.log("First: " + first + " at " + max1);
    console.log("Second: " + second + " at " + max2);
    console.log("Third: " + third + " at " + max3);
    console.log("Fourth: " + fourth + " at " + max4);
    console.log("Fifth: " + fifth + " at " + max5);

}

GetAnalysis();