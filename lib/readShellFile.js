var fs = require('fs');

module.exports = function(fname) {
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
