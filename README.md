# curlas

## npm install -g curlas

npm install -g curlas

## express

```
curlas "curl http://www.purepen.com -H 'A: 1' -H 'B: 2'" --javascript
curlas "curl http://www.purepen.com -H 'A: 1' -H 'B: 2'" --js
curlas "curl http://www.purepen.com -H 'A: 1' -H 'B: 2'" --js | node
curlas "curl http://www.purepen.com -H 'A: 1' -H 'B: 2'"
curlas "curl http://www.purepen.com -H 'A: 1' -H 'B: 2'" --bash
curlas "curl http://www.purepen.com -H 'A: 1' -H 'B: 2'" --sh
```

output

```
curl http://www.purepen.com \
-H 'A: 1' \
-H 'B: 2'
```

```
var request = require('request');

module.exports = function() {
  var url_ = "http://www.purepen.com";

  var opt_ = {
    "method": "GET",
    "url": url_,
    "headers": {
        "A": "1",
        "B": "2"
    }
  };
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
```
## but, save file for upload request 

![](_img/1.png)


```sh
vi /tmp/curl.sh
save to file

cat /tmp/curl.sh
curl 'http://localhost:3333/upload' -H 'Origin: http://localhost' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36' -H 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryrBg7MlrcbamQBPGE' -H 'Accept: */*' -H 'Referer: http://localhost/' -H 'Connection: keep-alive' --data-binary $'------WebKitFormBoundaryrBg7MlrcbamQBPGE\r\nContent-Disposition: form-data; name="name"\r\n\r\n0.txt\r\n------WebKitFormBoundaryrBg7MlrcbamQBPGE\r\nContent-Disposition: form-data; name="uuid"\r\n\r\n15622520882158097\r\n------WebKitFormBoundaryrBg7MlrcbamQBPGE\r\nContent-Disposition: form-data; name="file"; filename="0.txt"\r\nContent-Type: text/plain\r\n\r\n\r\n------WebKitFormBoundaryrBg7MlrcbamQBPGE--\r\n' --compressed

curlas /tmp/curl.sh --js
```

output

```js
var request = require('request');

module.exports = function() {
  var url_ = "http://localhost:3333/upload";

  var opt_ = {
    "method": "POST",
    "url": url_,
    "body": "------WebKitFormBoundaryrBg7MlrcbamQBPGE\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\n0.txt\r\n------WebKitFormBoundaryrBg7MlrcbamQBPGE\r\nContent-Disposition: form-data; name=\"uuid\"\r\n\r\n15622520882158097\r\n------WebKitFormBoundaryrBg7MlrcbamQBPGE\r\nContent-Disposition: form-data; name=\"file\"; filename=\"0.txt\"\r\nContent-Type: text/plain\r\n\r\n\r\n------WebKitFormBoundaryrBg7MlrcbamQBPGE--\r\n",
    "headers": {
        "Origin": "http://localhost",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36",
        "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryrBg7MlrcbamQBPGE",
        "Accept": "*/*",
        "Referer": "http://localhost/",
        "Connection": "keep-alive"
    }
  };
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
```

## more example
```sh
curlas "curl 'http://www.purepen.com' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36' --compressed" --js | node
```

output

```
null 200 blabla
```

