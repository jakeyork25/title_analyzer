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

const PrintTitleData = (dataArray) => {
    var placeList = dataArray[0];
    var maxList = dataArray[1];
    console.log(`-------- Top 5 Title Words --------`);
    for(var i = 0; i < 5; i++) {
        console.log("#" + (i + 1) + " is " + placeList[i] + " at " + maxList[i]);
    }
    console.log('-------- -------- -------- --------');
}

const GetTitleRankings = () => {
    
}