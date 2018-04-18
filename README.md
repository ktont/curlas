# curlas

## npm install -g curlas

npm install -g curlas

## Express

```
$ cat /tmp/1
curl http://localhost:3333 -H 'A: 1' -H 'B: 2' -H 'content-type: json' -d '{"a":1,"b":2}'

$ curlas /tmp/1 --js
module.exports = function() {
  var body_ = JSON.stringify({
    "a": 1,
    "b": 2
  });
  var opt_ = {
    "method": "POST",
    "headers": {
      "A": "1",
      "B": "2",
      "Content-Type": "json"
    },
    "url": "http://localhost:3333",
    "body": body_,
  };

  return new Promise((resolve, reject) => {
    request(opt_)
    ...


$ curlas /tmp/1 --js > /tmp/1.js; node /tmp/1.js | more
{
    "server": "WPWS/1.0.0",
    "date": "Thu, 12 Apr 2018 12:16:29 GMT",
    "content-type": "application/json;charset=UTF-8",
    "transfer-encoding": "chunked",
    "connection": "keep-alive",
    "content-encoding": "gzip",
    "vary": "Accept-Encoding"
}

{
    "status": 0,
    "data": [
        {
            "id": "1234666777789",
            "device": 5677543,
        }
        ....
```

## Chrome
![](_img/1.png)

## Usage

```sh
  Usage: curlas ./req.sh
         curlas ./req.sh --js
         curlas ./req.sh --sh
         curlas ./req.sh --python (future)
         curlas ./req.sh --java   (future)

         curlas ./req.sh --js --compressed
                 Http defalte/gzip compress ignored by default,
                 This parameter enable them. 
                 NOTE: Only curl command have the same parameter, it enabled. 
        
         curlas ./req.sh --js --timeout 30000
                 Default is 30000.
                 Http request will timeout after 30000 ms.
                 If you want disable timeout, specify 0.
                 Although is sending data, but if is timeout, it will
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
# comment line 1
# curl http://localhost:3333 -H 'A: 1' -H 'B: 2' -d '{"key":"val"}'

# comment line 3
curl http://localhost:3333 -H 'A: 1' -H 'B: 2' -d '{"key":"val"}'
```

## Record Macro
![](_img/2.png)

```
$ cat ./req.sh
# get session
# curl http://get/token -H 'A: 1' -H 'B: 2'

# get captcha
# curl http://get/captcah -H 'A: 1' -H 'B: 2'

# login
curl http://login -H 'A: 1' -H 'B: 2' -d '{"key":"val"}'

$ curlas ./req.sh --js
```

## Alter
![](_img/4.png)

## Support function

- url search parse
- cookie parse
- binary-body
- content-type: application/x-ndjson
- gzip deflate compress

## Support language

- [x] sh
- [x] nodejs
- [ ] java
- [ ] python




