const {URL, URLSearchParams} = require('url');
const util = require('util');

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

function _prettyPairs(arr) {
  var ret = arr.map(x => {
    if(x[1].length <=3 &&
        (/^[1-9][0-9]*$/.test(x[1]) || x[1] === '0')) x[1] = Number(x[1]);
    return '  ' + util.format(x);
  });
  return('[\n' + ret.join(',\n') + '\n]');
}

function prettyURL(url_) {
  var url = new URL(url_);
  if(!url.search) return {url: "'"+url_+"'"};
  //TODO: if no conflict key, use JSON
  var query = Array.from(url.searchParams);

  if(query.length <= 1) return {url: "'"+url_+"'"};

  //var query__ = JSON.stringify(query, null, 2);
  var query__ = _prettyPairs(query);
  query__ = _prettyJSON(query__, 2);

  return {
    url: '`'+url.origin+url.pathname+'?${query_}'+url.hash+'`',
    query: 'queryStringify('+query__+')',
  };
}

function queryStringify(param) {
  return new url.URLSearchParams(param).toString()
}

exports.parse = prettyURL;
exports.stringify = queryStringify;
