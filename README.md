# curlas

a web spider tool

## npm install -g curlas

npm install -g curlas

## Express

Run following in bash

```bash
cat <<"EOF" | curlas --js 
curl http://localhost:8000 \
-H 'Content-Type: json' \
-H 'cookie: tk=abcd' \
-d '{"foo":"bar"}'
EOF
```

The output is a javascript module

```js
function curlas(params) {
  var cookie_ = "tk=abcd";
  var body_ = JSON.stringify({
    "foo": "bar"
  });
  var opt_ = {
    "method": "POST",
    "headers": {
      "cookie": cookie_,
      "Content-Type": "json"
    },
    "url": "http://localhost:8000",
    "body": body_,
    "encoding": null
  };
  return new Promise((resolve, reject) => {
    var tm = setTimeout(reject, 30000, new Error('timeout'));
    request(opt_, (err, res, buff) => {
    ...
    }
  }
}
```

Your can run it directly.

```bash
cat <<"EOF" | curlas --js | node | more
curl http://localhost:8000 \
-H 'Content-Type: json' \
-H 'cookie: tk=abcd' \
-d '{"foo":"bar"}'
EOF
```

It pretty output json auto.

```json
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

Or save it as a module, put into your spider project.

```bash
cat <<"EOF" | curlas --js  > ./curlas/_getList.js
curl http://localhost:8000 \
-H 'Content-Type: json' \
-H 'cookie: tk=abcd' \
-d '{"foo":"bar"}'
EOF
```

## Usage

```sh
  Usage: curlas ./req.sh
         curlas ./req.sh --js
         curlas ./req.sh --sh
         curlas ./req.sh --python (future)
         curlas ./req.sh --java   (future)
         
         curlas ./req.sh --js --timeout 30000
                 Default is 30000.
                 Http request will timeout after 30000 ms.
                 If you want disable timeout, specify 0.
                 If is timeout, it timeout then req.end then finish, 
                 although maybe is sending data.
                 NOTE: this timeout is not TCP active timeout.

         curlas ./req.sh --js --retry 3
                 Default is 3
                 Http request, retry 3 times until success.
                 Retry break in the forlowing:
                     status code 404
                     http request invalid
                     host not found

         curlas ./req.sh --js --nogzip
                 Disable http deflate/gzip compress.
                 You may get a deflate/gzip stream.
                 NOTE: Only curl command have the same parameter, it enabled. 
        
$ cat ./req.sh
# comment line 1
# curl http://localhost:8000 -H 'A: 1' -H 'B: 2' -d '{"key":"val"}'

# comment line 3
curl http://localhost:8000 -H 'A: 1' -H 'B: 2' -d '{"key":"val"}'
```


## Chrome or Charles Network Capture
![](_img/1.png)

## Records
![](_img/2.png)

## Translate It
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




