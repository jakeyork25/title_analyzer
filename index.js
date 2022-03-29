import puppeteerExtra from 'puppeteer-extra';
import stealthPluggin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer';
import getPixels from 'get-pixels';
import ntc from 'name-that-color/lib/ntc.js';
import rgbHex from 'rgb-hex';

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

const LoadVideos = async (page, scrollAmount) => {
    await page.waitForSelector('yt-formatted-string[class="style-scope ytd-video-renderer"]');

    for(let i = 0; i < scrollAmount; i++) {
        await page.evaluate( () => {
            window.scrollBy(0, window.innerHeight * 5);
        });
        await page.waitForTimeout(4000);
    }
    return page;
}

const ScrapeVideos = async (page) => {
    var videoArray = await page.$x('//a[@id="video-title"]/yt-formatted-string');
    console.log("Array Length: " + videoArray.length);
    return videoArray; 
}

const GetWordArray = async (page, videoArray) => {
    var wordArray = [];
    for(let i = 0; i < videoArray.length; i++) {
        const element = videoArray[i];
        let text = await page.evaluate(el => el.textContent, element);
        text = CleanString(text);
        var splitTitleArray = text.split(' ');

        splitTitleArray.forEach(word => {
            wordArray.push(word);
        });
    }
    return wordArray;
}

const CleanWordArray = async (wordArray) => {
    wordArray.forEach((word, index) => {
        var lastChar = word.slice(-1);
        if(lastChar === "s") {
            var singularVersion = word.slice(0, word.length - 1);
            if(!wordArray.includes(singularVersion)) return;
            wordArray[index] = singularVersion;
        }
    });
    return wordArray;
}

const CreateCountObject = async (wordArray, searchTerm, tossArray) => {
    var count = {};
    wordArray.forEach((word) => { 
        var search = searchTerm.toLowerCase();
        if(!tossArray.includes(word) && !search.includes(word)) {
            { count[word] = (count[word]||0) + 1; }
        }
    });
    return count;
}

const GetTitleArray = async (count) => {
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
    var dataArray =[placeList, maxList];
    return dataArray;
}

const PrintTitleData = async (dataArray) => {
    var placeList = dataArray[0];
    var maxList = dataArray[1];
    console.log(`-------- Top 5 Title Words --------`);
    for(var i = 0; i < 5; i++) {
        console.log("#" + (i + 1) + " is " + placeList[i] + " at " + maxList[i]);
    }
    console.log('-------- -------- -------- --------');
}

const ConvertRGBToColor = (r, b, g) => {
    var hex = rgbHex(r, g, b);
    var n = ntc.name("#" + hex);
    var shadeName = n[3];
    return shadeName;
}

const GetPixelArray = async (page) => {
    var colorArray = [];
    var imageArray = [];
    // for(var y = 0; y < 10; y++) {
    // await page.evaluate( () => {
    //     window.scrollBy(0, window.innerHeight * 5);
    // });
    // }
    // for(var x = 0; x < 10; x++) {
    //     await page.evaluate(() => {
    //         window.scrollBy(0, -window.innerHeight * 5);
    //     });
    // }
    for(var j = 1; j < 21; j++) {
        var path = `//ytd-item-section-renderer/div[@id="contents"]/ytd-video-renderer[${j}]/div[1]/ytd-thumbnail/a/yt-img-shadow/img`;
        await page.waitForXPath(path);
        let [el] = await page.$x(path);
        await page.evaluate( () => {
            window.scrollBy(0, window.innerHeight * 1);
        });
        if(j % 6 == 0) await page.waitForTimeout(2000);
        await page.evaluate((element) => { element.scrollIntoView(); }, el);
        let text = await el.getProperty('src');
        let src = await text.jsonValue();
        src = src + ".png";
        console.log("Src: " + src);
        imageArray.push(src);
        await page.waitForTimeout(200);
    }
    for(var x = 1; x < 11; x++) {
        var path = `//ytd-item-section-renderer[2]/div[@id="contents"]/ytd-video-renderer[${x}]/div[1]/ytd-thumbnail/a/yt-img-shadow/img`;
        await page.waitForXPath(path);
        let [el] = await page.$x(path);
        await page.evaluate( () => {
            window.scrollBy(0, window.innerHeight * 1);
        });
        if(j % 6 == 0) await page.waitForTimeout(2000);
        await page.evaluate((element) => { element.scrollIntoView(); }, el);
        let text = await el.getProperty('src');
        let src = await text.jsonValue();
        src = src + ".png";
        console.log("Src: " + src);
        imageArray.push(src);
        await page.waitForTimeout(200);
    }
    console.log("Image array length: " + imageArray.length);
    for(var i = 0; i < imageArray.length; i++) {
        let imgSrc = imageArray[i];
        getPixels(imgSrc, function(err, pixels) {
            if(err) {
                console.log("Bad image path")
                return
            }
            var iw = (pixels.shape.slice(0, 1)/10) - 1;
            var ih = (pixels.shape.slice(1, 2)/10) - 1;
            
            for(var i = 1; i < 11; i++) {
                for(var j = 1; j < 11; j++) {
                    var r = pixels.get(j*iw, i*ih, 0);
                    var g = pixels.get(j*iw, i*ih, 1);
                    var b = pixels.get(j*iw, i*ih, 2);
                    var color = ConvertRGBToColor(r, g, b);
                    colorArray.push(color);
                }
            }
        });
    }
    await page.waitForTimeout(3000);
    console.log("Color array length: " + colorArray.length);
    return colorArray;
}

const CreateColorObject= (colorArray) => {
    var colorObj = {};
    colorArray.forEach((color) => { 
        { colorObj[color] = (colorObj[color]||0) + 1; }
    });
    return colorObj;
}

const GetColorArray = (colorObj) => {
    let placeList = ["", "", "", "", ""];
    let maxList = [0, 0, 0, 0, 0];

    Object.entries(colorObj).forEach(([key, value]) => {
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
    var dataArray =[placeList, maxList];
    return dataArray;
}

const PrintColorData = (dataArray) => {
    var placeList = dataArray[0];
    var maxList = dataArray[1];
    console.log(`-------- Top 5 Thumbnail Colors --------`);
    for(var i = 0; i < 5; i++) {
        console.log("#" + (i + 1) + " is " + placeList[i] + " at " + maxList[i] + "%");
    }
    console.log('--------- --------- --------- ---------');
}

const GetColors = async (page) => {
    await page.waitForTimeout(4000);
    
    var colorArray = await GetPixelArray(page);
    var colorObj = CreateColorObject(colorArray);
    var dataArray = GetColorArray(colorObj);
    PrintColorData(dataArray);
}

const tossArray = ['the', 'and', 'in', 'that', 'so', 'a', 'an', 'in', 'on', 'to', 'of'];

const GetTitleData = async () => {
    const browser = await CreateBrowser();
    let page = await CreatePage(browser);
    const searchTerm = "chainsaw man";
    
    page = await SearchForVideos(page, searchTerm);
    page = await LoadVideos(page, 0);

    console.log("Videos have loaded!");

    await GetColors(page);


    //const videoArray = await ScrapeVideos(page);
    //let wordArray = await GetWordArray(page, videoArray);
    //wordArray = await CleanWordArray(wordArray);
    //const count = await CreateCountObject(wordArray, searchTerm, tossArray);
    //const titleDataArray = await GetTitleArray(count);
    //await PrintTitleData(titleDataArray);

    //await browser.close();
}

GetTitleData();