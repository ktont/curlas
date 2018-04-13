module.exports = function(s) {
  s = s.trim();
  s = s + ' ';

  const arr_ = [];
  const ret = [];

  var expectWord = true;
  var closeChar = '';
  var expand = false;

  var escapedChar = ''; // 用来标记下一个字符是不是escaped char

  for(var i = 0; i < s.length; i++) {
    var char = s[i];
    if(escapedChar) {
      escapedChar = '';
      arr_.push(char);
      continue;
    } else if(char === '\\') {
      escapedChar = char;
    }

    if(expectWord) {
      expectWord = false;
      if(char === "'" || char === '"') {
        closeChar = char;
        continue;
      } else if(char === '$') {
        expectWord = true;
        expand = true;
        continue; //注意：这里$的含义是替换后面的转义
      }
    }

    if(closeChar === char) {
      closeChar = '';
      continue;
    }


    arr_.push(char);


    if(closeChar) continue;

    if(char === ' ') {
      arr_.pop();
      let sub_ = arr_.join(''); while(arr_.pop());
      if(expand) {
        sub_ = sub_.replace(/\\./g, function($1) {
          switch($1[1]) {
            case 'r': return '\r';
            case 'n': return '\n';
            case 'b': return '\x08';
            case 'f': return '\x0c';
            case 't': return '\x09';
            case 'u': return $1;
            default: return $1[1];
          }
        });
      }
      ret.push(sub_);
      expectWord = true;
    }
  }

  if(escapedChar) throw new Error('unclosed escaped char');
  return ret;
}