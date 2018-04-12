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
  }
}
```

## Chrome
![](_img/1.png)

## Usage

```sh
         curlas ./req.sh
         curlas ./req.sh --js
         curlas ./req.sh --sh
         curlas ./req.sh --python (future)
         curlas ./req.sh --java   (future)

$ cat ./req.sh
curl http://localhost:3333 -H 'A: 1' -H 'B: 2' -d '{"key":"val"}'
```

## Support function

- url search parse
- cookie parse
- binary-body
- content-type: application/x-ndjson
- gzip deflate compress

## Support language

- [ ] sh
- [ ] nodejs
- [x] java
- [x] python




