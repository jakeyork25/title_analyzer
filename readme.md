# Description

The title analyzer uses Puppeteer and Node.js to collect titles the titles of YouTubes videos\
and finds the most common keywords within them to determine those that help make certain videos popular.

## Installations

You will need to have Node.js installed on your machine to begin with.\
After opening the project you will have to run three installs, which can stay as one line.\

### `npm install puppeteer puppeteer-extra puppeteer-extra-pluggin-stealth`

This project utilizes Puppeteer to interact with the YouTube pages. This can become much\
more powerful if you were to check out each individual video and collect the description and\
comments for more data. With additional technology you could even use screenshots of the thumbnails\
to interperet what color schemes or images help make videos more popular.

## Searching

The only thing that needs to be changed in the index.js file is the variable "searchTerm",\
whcih will be the input in the YouTube search bar. This will determine the videos pulled up\
and consequentially the titles that Puppeteer scrapes.

## Title Amount

The current solution to loading more videos for the project is to loop through a quick\
scroll function using Puppeteer, allowing some time for videos to load before scrolling again.\
An iteration of 5 scrolls pulls up a total of about 40 videos, without any scrolling it's\
about 24. Each iteration gives the page 5 seconds of load time, but it allows more titles\
to be scraped. Ultimately you can lower or raise it as much as you need, depending on if you\
want more data or less load time.

