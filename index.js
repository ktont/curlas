#!/usr/bin/env node

var fs = require('fs');
var parseCurl = require('./thirdPart/parse-curl.js');
var prettyBash = require('./lib/pretty.js');
var prettyURL = require('./lib/prettyURL.js');
var binaryString = require('./lib/binaryString.js');
var cookieModule = require('./thirdPart/cookie.js');
var ndjson = require('./thirdPart/ndjson.js');

function Usage() {
  console.log(`
  Usage: curlas ./req.sh
         curlas ./req.sh --js
         curlas ./req.sh --sh
         curlas ./req.sh --python (future)
         curlas ./req.sh --java   (future)

$ cat ./req.sh
curl http://localhost:3333 -H 'A: 1' -H 'B: 2' -d '{"key":"val"}'
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
      case '--java':
      case '--python':
        Usage();
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

function _parseCurl(curl) {
  var origin_ = parseCurl(curl);
  if(!origin_) Usage();

  var pruned_ = JSON.parse(JSON.stringify(origin_));

  if(pruned_.headers['content-type']) {
    pruned_.headers['Content-Type'] = pruned_.headers['content-type'];
    delete pruned_.headers['content-type'];
  }
  
  if(pruned_.body != null && !pruned_.headers['Content-Type']) {
    pruned_.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  if(!Object.keys(pruned_.headers).length) {
    delete pruned_.headers;
  }
  
  //console.error('rrrrrrrr', pruned_);
  return [pruned_, origin_];
}

///////////////////////////////////main////////////////////////////////
///////////////////////////////////////////////////////////////////////
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

var [pruned_, origin_] = _parseCurl(curl);

var additionVariable = [];
var additionRequire = [];
var additionFunction = [];

var str_ = JSON.stringify(pruned_, null, 2);

str_ = str_.replace(/"url": "(.*)",?/, function(_, $1) {
  if($1.length < 22) {
    return `"url": "${$1}",`;
  }

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
  if($1.length < 5) {
    return `"body": "${$1}",`;
  }

  const contype = pruned_.headers["Content-Type"];
  const hasUserContype = !!(origin_.headers["Content-Type"] || 
                            origin_.headers['content-type']);

  if(contype.startsWith('application/x-www-form-urlencoded') &&
     hasUserContype) {
    let b = require('querystring').parse($1);  
    b = JSON.stringify(b, null, 2);
    b = _prettyJSON(b, 2);
    additionRequire.push("const querystring = require('querystring');");
    additionVariable.push(`var body_ = querystring.stringify(${b});`);
  } else if(contype.startsWith('application/x-ndjson')) {
    let b = ndjson.parse($1, 2);
    additionFunction.push(ndjson.stringify.toString());
    additionVariable.push(`var body_ = ndjsonStringify(${b});`);
  } else if(contype.startsWith('application/json')) {
    let b = JSON.parse(binaryString.reduce($1));
    b = JSON.stringify(b, null, 2);
    b = _prettyJSON(b, 2);
    additionVariable.push(`var body_ = JSON.stringify(${b});`);
  } else {
    // 猜测是json
    let b;
    try {
      if($1[0] !== '{' || $1[$1.length-1] !== '}') throw 'break';
      b = JSON.parse(binaryString.reduce($1));
      if(Object.keys(b).length < 1) throw 'break';
      b = JSON.stringify(b, null, 2);
      b = _prettyJSON(b, 2);
      b=`JSON.stringify(${b})`;
    } catch(e) {
      b = '"'+$1+'"';
    }
    additionVariable.push(`var body_ = ${b};`);
  }
  return '"body": body_,';
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
        body: buf
      })
    })
    .on('error', function(err) {
      reject(err);
    });
  })
}
${additionFunction.length ? '\n'+additionFunction.join('\n\n')+'\n' : ''}
module.exports()
.then((origin_) => {
  let str = origin_.body.toString();
  if(str[0] == '{' && str[str.length-1] == '}') {
    try {
      str = JSON.stringify(JSON.parse(str), null, 4);
    } catch(e) {}
  }
  console.log(JSON.stringify(origin_.header, null, 4));
  console.log();
  console.log(str);
})
.catch(console.error)`)
