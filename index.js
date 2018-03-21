
var parseCurl = require('./thirdPart/parse-curl.js');
var fs = require('fs');

var curl = process.argv[2];

function Usage() {
  console.log(`
  Usage: curlas ./file/name/req.sh
    或者
         curlas "curl http://lcoal.com -H 'Accept-Encoding: gzip, deflate' -H 'Cookie: a=1'"
  `);
  process.exit(1);
}

if(!curl) Usage();

if(!/^\s*curl /.test(curl)) {
  if(fs.existsSync(curl)) {
    curl = fs.readFileSync(curl, 'utf8');
  } else {
    Usage();
  }
}

var root_ = parseCurl(curl);

root_.headers = root_.header;
delete root_.header;

var str_ = JSON.stringify(root_, null, 4);

var url_ = '', cookie_ = '';
str_ = str_.replace(/"url": (.*),/, function(_, $1) {
  url_ = `var url_ = ${$1};`;
  return '"url": url_,';
});

str_ = str_.replace(/"Cookie": "(.*)",?/, function(_, $1) {
  cookie_ = `var cookie_ = "${$1}";`;
  return '"Cookie": cookie_,';
});

str_ = str_.slice(0, str_.length-1) + '  }';

console.log(`
var request = require('request');

module.exports = function() {
  ${url_}
  ${cookie_}
  var opt_ = ${str_};
  return new Promise((resolve, reject) => {
    request(opt_, (err, res, body) => {
      console.log(err, res.statusCode, body);
      if(err) return reject(err);      
      if(res.statusCode !== 200) {
        return reject(new Error('statusCode'+res.statusCode));
      }
      return resolve(body);
    });
  });
}

module.exports();
`)
