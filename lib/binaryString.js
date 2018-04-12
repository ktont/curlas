exports.reduce = function(str) {
  return str.replace(/\\./g, function($1) {
    switch($1[1]) {
      case 'r': return '\r';
      case 'n': return '\n';
      case 'b': return '\x08';
      case 'f': return '\x0c';
      case 't': return '\x09';
      default: return $1[1];
    }
  });
}

