const webscraper = require('./lib/WebScrapper.js').WebScrapper;
var WebScrapper = new webscraper();

var websiteToScrape = "https://medium.com/";
var fileName = "List_of_URLs.txt";

WebScrapper.main(websiteToScrape, fileName);