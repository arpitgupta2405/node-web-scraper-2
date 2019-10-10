const webscraper = require('./lib/WebScrapper.js').WebScrapper;
var WebScrapper = new webscraper();

var websiteToScrape = "https://medium.com/";

WebScrapper.main(websiteToScrape);