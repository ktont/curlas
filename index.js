#!/usr/bin/env node

var fs = require('fs');
var parseCurl = require('./thirdPart/parse-curl.js');
var prettyBash = require('./lib/pretty.js');
var prettyURL = require('./lib/prettyURL.js');
var cookieModule = require('./thirdPart/cookie.js');
var ndjson = require('./thirdPart/ndjson.js');

function Usage() {
  console.log(`
  Usage: curlas ./file/name/req.sh
    或者
         curlas "curl http://localhost -H 'Accept-Encoding: gzip, deflate' -H 'Cookie: a=1'"
  `);
  process.exit(1);
}

function _parseArgv() {
  var _ = [];
  var args_ = process.argv.slice(2);
  var type = 'bash';

  for(var i = 0; i < args_.length; i++) {
    let a = args_[i];
    switch(a) {
      case '--bash': 
      case '--sh': 
        type = 'bash';
        break;
      case '--javascript': 
      case '--js': 
        type = 'javascript';
        break;
      default:
        _.push(a);
        break;
    }
  }
  return [type, _[0]];
}

function _prettyJSON(str, n) {
  var space = [];
  while(n--) space.push(' ');
  space = space.join('');
  var sp_ = str.split('\n');
  for(var i = 1; i < sp_.length; i++) {
    sp_[i] = space + sp_[i];
  }
  return sp_.join('\n');
}

function _prettyArray(sp_, n) {
  var space = [];
  while(n--) space.push(' ');
  space = space.join('');
  for(var i = 1; i < sp_.length; i++) {
    sp_[i] = space + sp_[i];
  }
}

var [outputType, curl] = _parseArgv();

if(!curl) Usage();

if(!/^\s*curl /.test(curl)) {
  if(fs.existsSync(curl)) {
    curl = fs.readFileSync(curl, 'utf8');
  } else {
    Usage();
  }
}

if(outputType == 'bash') {
  console.log();
  console.log(prettyBash(curl));
  console.log();
  process.exit(0);
}

var root_ = parseCurl(curl);

var additionVariable = [];
var additionRequire = [];
var additionFunction = [];

var str_ = JSON.stringify(root_, null, 2);

str_ = str_.replace(/"url": "(.*)",?/, function(_, $1) {
  var u = prettyURL.parse($1);
  if(u[0] == '`') {
    additionRequire.push("const url = require('url');");
    additionFunction.push(prettyURL.stringify.toString());
  }
  additionVariable.push(`var url_ = ${u};`);
  return '"url": url_,';
});

str_ = str_.replace(/"Cookie": "(.*)",?/, function(_, $1) {
  if($1.length > 50) {
    let c = cookieModule.parse($1);
    c = JSON.stringify(c, null, 2);
    c = _prettyJSON(c, 2);
    additionFunction.push(cookieModule.stringify.toString());
    additionVariable.push(`var cookie_ = cookieStringify(${c});`);
    return '"Cookie": cookie_,';
  } else {
    additionVariable.push(`var cookie_ = "${$1}";`);
    return '"Cookie": cookie_,';
  }
});

str_ = str_.replace(/"body": "(.*)",?/, function(_, $1) {
  const contype = root_.headers["Content-Type"] ||
                  root_.headers["content-type"];

  if(contype && contype.startsWith('application/x-www-form-urlencoded')) {
    let b = require('querystring').parse($1);  
    b = JSON.stringify(b, null, 2);
    b = _prettyJSON(b, 2);
    additionRequire.push("const querystring = require('querystring');");
    additionVariable.push(`var body_ = querystring.stringify(${b});`);
    return '"body": body_,';
  } else if(contype && contype.startsWith('application/x-ndjson')) {
    let b = ndjson.parse($1, 2);
    additionFunction.push(ndjson.stringify.toString());
    additionVariable.push(`var body_ = ndjsonStringify(${b});`);
    return '"body": body_,';
  } else {
    additionVariable.push(`var body_ = "${$1}";`);
    return '"body": body_,';
  }
});

additionVariable.push(`var opt_ = ${_prettyJSON(str_, 2)};`);
_prettyArray(additionVariable, 2);

console.log(`const request = require('request');
const zlib = require('zlib');
${additionRequire.length ? additionRequire.join('\n')+'\n' : ''}
module.exports = function() {
  ${additionVariable.join('\n')}

  return new Promise((resolve, reject) => {
    let header = null;
    const bufs = [];
    request(opt_)
    .on('response', function(res) {
      if(res.statusCode !== 200) {
        return reject(new Error('statusCode'+res.statusCode));
      }
      header = res.headers;
    })
    .on('data', bufs.push.bind(bufs))
    .on('end', function() {
      let buf = Buffer.concat(bufs);
      switch (header['content-encoding']) {
        case 'gzip':
          buf = zlib.unzipSync(buf);
          break;
        case 'deflate':
          buf = zlib.inflateSync(buf);
          break;
        default:
          break;
      }
      resolve({
        header,
        body: buf.toString()
      })
    })
    .on('error', function(err) {
      reject(err);
    });
  })
}
${additionFunction.length ? '\n'+additionFunction.join('\n\n')+'\n' : ''}
module.exports()
.then(console.log)
.catch(console.error)`)
