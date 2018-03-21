# curlas

npm install -g curlas

![](_img/1.png)


```sh
$ curlas "curl 'http://www.baidu.com/' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36' --compressed"

```

output

```js
var request = require('request');

module.exports = function() {
  var url_ = "http://www.baidu.com/";

  var opt_ = {
    "method": "GET",
    "url": url_,
    "headers": {
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36",
        "Accept-Encoding": "deflate, gzip"
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

or run it

```sh
$ curlas "curl 'http://www.baidu.com/' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36' --compressed" | node
null 200 '{"code":"006","errParams":[],"data":null,"success":false}'
```