# curlas

![](_img/1.png)


```sh
save to ./3.txt

$ curlas ./3.txt

```

output

```js
var request = require('request');

module.exports = function() {
  var url_ = "http://ec.iot.10086.cn/api/service/auth/cmp/checkState?_timestamp=1521615038059";
  var cookie_ = "_CMPSECURITY=19D9B500B36072BF3F51FF48461A2ADD68B34DD52A2363CCA5010570CB5F97D51A9CE3654F7156428A01813659C05F09; _CMPSID=+rZhFyEl30d5IV2YqF/nLQ==";
  var opt_ = {
    "method": "GET",
    "url": url_,
    "headers": {
        "accessToken": "+rZhFyEl30d5IV2YqF/nLQ==",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "http://ec.iot.10086.cn/cmp/",
        "Cookie": cookie_,
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

or run it

```sh
$ curlas ./3.txt | node
null 200 '{"code":"006","errParams":[],"data":null,"success":false}'
```