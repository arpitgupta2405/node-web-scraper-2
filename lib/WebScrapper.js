const https = require('https');
const fs = require('fs');
const url = require('url');
const mysql = require('mysql');

const regexp = /href="/gi;

const connection = mysql.createConnection({
 user: 'root', //freetemplates
 password: 'Gmail@123', //eglPQiTptkRh
 database: 'Web_Scraper',
 host: '127.0.0.1', //prod db need to be put
});

var globleurls = new Map();

https.globalAgent.maxSockets = 5;
https.globalAgent.keepAlive = true;

function executeQuery(query, values) {
 return new Promise((resolve, reject) => {
  return connection.query(query, values, (error, results, fields) => {
   if (error) {
    console.log(error);
    return reject(error);
   }
   return resolve(results);
  });
 });
}

async function makeEntry(url, count) {
 let query = `INSERT INTO scraped_urls (url, count) VALUES (?, ?);`;
 let values = [url, count];

 return new Promise((resolve, reject) => {
  return executeQuery(query, values)
   .then((results) => {
    if (results.length > 0) {
     return resolve(true);
    } else {
     return resolve(false);
    }
   });
 });
}

async function updateEntry(url, count) {
 let query = `UPDATE scraped_urls SET count = ? WHERE url = ?;`;
 let values = [count, url];

 return new Promise((resolve, reject) => {
  return executeQuery(query, values)
   .then((results) => {
    if (results.length > 0) {
     return resolve(true);
    } else {
     return resolve(false);
    }
   });
 });
}

function WebScrapper() {

}

WebScrapper.prototype.getAllHyperlinks = async function(url, hostname) {

 var urls = new Map();

 return new Promise((resolve, reject) => {
  console.log(url);
  https.get(url, (resp) => {
   let html = '';

   resp.on('data', (chunk) => {
    html += chunk;
   });

   resp.on('end', () => {
    while ((match = regexp.exec(html)) != null) {
     var startIndex = match.index + 6;
     var endIndex = html.indexOf('"', startIndex);
     url = html.substring(startIndex, endIndex);
     if (url.indexOf('xml') === -1 && url.indexOf('cdn-') === -1 && url.indexOf('https://') > -1 && url.indexOf('android-app') === -1 && url.indexOf('js') === -1 && url.indexOf('.css') === -1 && url.indexOf(hostname) > -1) {
      if (url.indexOf('?') > -1) {
       url = url.substring(0, url.indexOf('?'));
      }
      if (urls.has(url)) {
       let d = urls.get(url);
       urls.set(url, d + 1);
      } else {
       urls.set(url, 1);
      }
     }
    }
    return resolve(urls);
   });

   resp.on('error', (chunk) => {
    console.log("Error: " + err.message);
    return reject({});
   });

  });
 });
}


WebScrapper.prototype.main = async function(website) {
 var self = this;
 var hostname = url.parse(website).hostname;

 globleurls.set(website, 1);
 await makeEntry(website, 1);

 (async function loop() {
  for (let [item, value] of globleurls) {
   if (item && item.indexOf('https://') > -1) {
    var p = await self.getAllHyperlinks(item, hostname);
    p.forEach(async (value, r) => {
     if (globleurls.has(r)) {
      let d = globleurls.get(r);
      globleurls.set(r, d + 1);
      await updateEntry(r, d + 1);
     } else {
      globleurls.set(r, 1);
      await makeEntry(r, 1);
     }
    });
   }
  }
 })();
}

module.exports.WebScrapper = WebScrapper;