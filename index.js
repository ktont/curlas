#!/usr/bin/env node

var fs = require('fs');
var prettyBash = require('./lib/pretty.js');
var prettyURL = require('./lib/prettyURL.js');
var binaryString = require('./lib/binaryString.js');
var readShellFile = require('./lib/readShellFile.js');
var parseCurl = require('./thirdPart/parse-curl.js');
var cookieModule = require('./thirdPart/cookie.js');
var ndjson = require('./thirdPart/ndjson.js');

function Usage() {
  console.error(`
  Usage: curlas ./req.sh
         curlas ./req.sh --js
         curlas ./req.sh --sh
         curlas ./req.sh --python (future)
         curlas ./req.sh --java   (future)

         curlas ./req.sh --js --output /tmp/req.js
         curlas ./req.sh --js -o /tmp/req.js
                 write output to /tmp/req.sh
                 feature: require.main === module

         curlas ./req.sh --js --timeout 30000
                 Default is 30000.
                 Http request will timeout after 30000 ms.
                 If you want disable timeout, specify 0.
                 Although is sending data, if is timeout, it will
                 timeout. 
                 NOTE: this timeout is not TCP timeout.

         curlas ./req.sh --js --retry 3
                 Default is 3
                 Http request, retry 3 times until success.
                 Retry break in the forlowing:
                     status code 404
                     http request invalid
                     host not found
                 

$ cat ./req.sh
curl http://localhost:3333 -H 'A: 1' -H 'B: 2' -d '{"key":"val"}'
`);
  process.exit(1);
}

function _validateTimeout(n) {
  if(n == null) Usage();
  n = Number(n);
  if(isNaN(n)) Usage();
  return n;
}

function _validateRetry(n) {
  if(n == null) Usage();
  n = Number(n);
  if(isNaN(n)) Usage();
  if(n < 0 || n > 100) Usage();
  return n;
}

function _validateOutput(fname) {
  if(!fname) Usage();
  if(fname[0] == '-') Usage();
  return fname;
}

function _parseArgv() {
  var _ = [];
  var args_ = process.argv.slice(2);
  var type = 'bash';
  var compressedFlag = true;
  var timeout = 30000;
  var retry = 3;
  var output = '';

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
      case '--nocompessed':
        console.error("this is `--compressed'?");
        process.exit(1);
        break;
      case '--nogzip':
      case '--nocompressed':
        compressedFlag = false;
        break;
      case '--timeout':
        timeout = _validateTimeout(args_[++i]);
        break;
      case '--retry':
        retry = _validateRetry(args_[++i]);
        break;
      case '--output':
      case '-o':
        output = _validateOutput(args_[++i]);
        break;
      case '--version':
      case '-v':
        console.log('curlas', require('./package.json').version);
        console.log('Features: retry, timeout, javascript')
        process.exit(0);
      default:
        _.push(a);
        break;
    }
  }
  return [
    type, 
    _[0], 
    compressedFlag, 
    timeout, 
    retry,
    output
  ];
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

function _parseCurl(curl, compressedFlag) {
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

  if(compressedFlag) {
    pruned_["gzip"] = true;
  }

  if(!Object.keys(pruned_.headers).length) {
    delete pruned_.headers;
  }

  pruned_["encoding"] = null;

  return [pruned_, origin_];
}

///////////////////////////////////main////////////////////////////////
///////////////////////////////////////////////////////////////////////
var [
  outputType, 
  curl, 
  compressedFlag, 
  timeoutParam,
  retryParam,
  outputParam,
] = _parseArgv();

if(!curl) Usage();

if(!/^\s*curl /.test(curl)) {
  curl = readShellFile(curl);
  if(curl == null) Usage();
}

if(outputType == 'bash') {
  console.log();
  console.log(prettyBash(curl));
  console.log();
  process.exit(0);
}

compressedFlag = compressedFlag && curl.includes(' --compressed') ? 
    true : 
    false; // readable

var [pruned_, origin_] = _parseCurl(curl, compressedFlag);

var additionVariable = [];
var additionRequire = [];
var additionFunction = [];

var str_ = JSON.stringify(pruned_, null, 2);

str_ = str_.replace(/"url": "(.*)",?/, function(_, $1) {
  if($1.length < 22) {
    return `"url": "${$1}",`;
  }

  var u = prettyURL.parse($1);
  if(u.query) {
    additionRequire.push("const url = require('url');");
    additionFunction.push(prettyURL.stringify.toString());
    additionVariable.push(`var query_ = ${u.query};`);
    additionVariable.push(`var url_ = ${u.url};`);
  } else {
    additionVariable.push(`var url_ = ${u.url};`);
  }
  return '"url": url_,';
});

str_ = str_.replace(/"([Cc]ookie)": "(.*)",?/, function(_, key, $1) {
  if($1.length > 50) {
    let c = cookieModule.parse($1);
    c = JSON.stringify(c, null, 2);
    c = _prettyJSON(c, 2);
    additionFunction.push(cookieModule.stringify.toString());
    additionVariable.push(`var cookie_ = cookieStringify(${c});`);
    return `"${key}": cookie_,`;
  } else {
    additionVariable.push(`var cookie_ = "${$1}";`);
    return `"${key}": cookie_,`;
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

function renderBody() {

return `function curlas(params) {
  ${additionVariable.join('\n')}
  return new Promise((resolve, reject) => {` + (timeoutParam ? 
`
    var tm = setTimeout(reject, ${timeoutParam}, new Error('timeout'));` : '') +
`
    request(opt_, (err, res, buff) => {` + (timeoutParam ? 
`
      clearTimeout(tm);` : '') +
`
      if(err) return reject(err);
      if(res.statusCode !== 200) {
        return reject(new Error('statusCode'+res.statusCode));
      }
      return resolve({
        header: res.headers,
        body: buff
      });
    });
  });
}

module.exports = async function(params = {}, retry = ${retryParam}) {
  var ret = null, err = null;
  var sleep = (n) => new Promise(A => setTimeout(A, n));
  for(var i = 0; i <= retry; i++) {
    try {
      ret = await curlas(params);
      ret.retry = i;
      return ret;
    } catch(e) {
      err = e;
      if(/statusCode4[0-9][0-9]/.test(e.message)) 
        break;
      if(e.message !== 'timeout')
        await sleep(i*100);
    }
  }
  throw err;
}`;

}

function renderFooter() {
  if(outputParam) {
return `if(require.main === module) {
  module.exports()
  .then((root_) => {
    let str = root_.body.toString();
    try {
      str = JSON.stringify(JSON.parse(str), null, 4);
    } catch(e) {}
    console.log(JSON.stringify(root_.header, null, 4));
    console.log();
    console.log(str);
    console.log();
    console.log('retry', root_.retry, 'times');
  })
  .catch(console.error)
}
`
  } else {
return `module.exports()
.then((root_) => {
  let str = root_.body.toString();
  try {
    str = JSON.stringify(JSON.parse(str), null, 4);
  } catch(e) {}
  console.log(JSON.stringify(root_.header, null, 4));
  console.log();
  console.log(str);
  console.log();
  console.log('retry', root_.retry, 'times');
})
.catch(console.error)
`
  }
}

function render() {
  const body = renderBody();
  const footer = renderFooter();

return `const request = require('request');
${additionRequire.length ? additionRequire.join('\n')+'\n' : ''}
${body}
${additionFunction.length ? '\n'+additionFunction.join('\n\n')+'\n' : ''}
${footer}
`;

}


if(outputParam) {
  fs.writeFileSync(outputParam, render());
} else {
  process.stdout.write(render());
}
