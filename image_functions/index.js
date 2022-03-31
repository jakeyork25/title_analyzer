const ConvertRGBToColor = (r, b, g) => {
    var hex = rgbHex(r, g, b);
    var n = ntc.name("#" + hex);
    var shadeName = n[3];
    return shadeName;
}

const GetSectionArray = (len) => {
    if(len > 2) return [2, 3];
    return [1, 2];
}

const GetPixelRGB = (i, j, width, height) => {
    var r = pixels.get(j*width, i*height, 0);
    var g = pixels.get(j*width, i*height, 1);
    var b = pixels.get(j*width, i*height, 2);
    return [r, g, b];
}

const UpdateColorArray = (rgbArray, colorArray) => {
    var color = ConvertRGBToColor(rgbArray[0], rgbArray[1], rgbArray[2]);
    colorArray.push(color);
    return colorArray;
}

const CreateImageArray = async (page, sections) => {
    var imageArray = [];
    for(var i = 1; i < 20; i++) {
        if(i < 20) imageArray = UpdateImageArray(page, i, sections[0], imageArray);
        else imageArray = UpdateImageArray(page, i, sections[1], imageArray);
    }
    console.log("Image array length: " + imageArray.length);
    return imageArray;
}

const UpdateImageArray = async (page, i, section, imageArray) => {
    var path = `//ytd-item-section-renderer[${section}]/div[@id="contents"]/ytd-video-renderer[${i}]/div[1]/ytd-thumbnail/a/yt-img-shadow/img`;
    await page.waitForXPath(path);
    let [el] = await page.$x(path);
    await page.evaluate((element) => { element.scrollIntoView(); }, el);
    let text = await el.getProperty('src');
    let src = (await text.jsonValue()) + '.png';
    console.log("Src: " + src);
    imageArray.push(src);
    return imageArray;
}

const DeriveColorsFromImages = (imageArray) => {
    var colorArray = [];
    for(var i = 0; i < imageArray.length; i++) {
        let imgSrc = imageArray[i];
        getPixels(imgSrc, function(err, pixels) {
            if(err) {
                console.log("Bad image path")
                return
            }
            var imageWidth = (pixels.shape.slice(0, 1)/10) - 1;
            var imageHeight = (pixels.shape.slice(1, 2)/10) - 1;
            for(var i = 1; i < 11; i++) {
                for(var j = 1; j < 11; j++) {
                    var rgbArray = GetPixelRGB(i, j, imageWidth, imageHeight);
                    colorArray = UpdateColorArray(rgbArray, colorArray);
                }
            }
        });
    }
    return colorArray;
}

const CreateColorArray = async (page) => {
    var sectionCount = await page.$x('//ytd-item-section-renderer');
    var sections = GetSectionArray(sectionCount.length);
    var imageArray = CreateImageArray(page, sections);
    var colorArray = DeriveColorsFromImages(imageArray);
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

const CreateDataArray = (colorObj) => {
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

const PrintColorData = (dataArray, pixelCount) => {
    var placeList = dataArray[0];
    var maxList = dataArray[1];
    console.log(`-------- Top 5 Thumbnail Colors --------`);
    for(var i = 0; i < 5; i++) {
        console.log("#" + (i + 1) + " is " + placeList[i] + " at " + Math.round((maxList[i] / pixelCount) * 100) + "%");
    }
    console.log('--------- --------- --------- ---------');
}

const GetColorRankings = async (page) => {
    await page.waitForTimeout(4000);   
    var colorArray = await CreateColorArray(page);
    var colorObj = CreateColorObject(colorArray);
    var dataArray = GetColorArray(colorObj);
    PrintColorData(dataArray, colorArray.length);
}