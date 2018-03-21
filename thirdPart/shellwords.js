module.exports = function(s) {
  s = s.trim();
  s = s + ' ';

  const arr_ = [];
  const ret = [];

  var expectWord = true;
  var closeChar = '';
  var expand = false;

  for(var i = 0; i < s.length; i++) {
    var char = s[i];
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
        sub_ = sub_
          .replace(/\\r/g, '\r')
          .replace(/\\n/g, '\n');
        expand = false;
      }
      ret.push(sub_);
      expectWord = true;
    }
  }
  return ret;
}