var fs = require('fs');

function _readTextFile(fname) {
  if(!fs.existsSync(fname)) return null;
  var cont = fs.readFileSync(fname, 'utf8');
  var sp = cont.trim().split('\n');
  for(var i = 0; i < sp.length; i++) {
    var line = sp[i].trim();
    if(!line) continue;
    if(line[0] !== '#') return line;
  }
  return null;
}

module.exports = function(fname) {
  if(process.stdin.isTTY) {
    if(!fname) return Promise.resolve(null);
  
    if(/^curl /.test(fname)) {
      return Promise.resolve(fname);
    }
  
    return Promise.resolve(_readTextFile(fname));
  }

  return new Promise((resolve, reject) => {
    var bufs = [];
    process.stdin
    .on('data', bufs.push.bind(bufs))
    .on('end', () => {
      resolve(
        Buffer.concat(bufs)
        .toString()
        .replace(/\\\n/g, '')
      );
    });
  })
}