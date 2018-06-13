# curlas

a web spider tool

## npm install -g curlas

npm install -g curlas

## Usage

Chrome / Charles / Postman, network capture

Copy

![](_img/1.png)


Run cmd.exe or terminal

Paste

![](_img/6.png)


```bash
cat <<"EOF" | curlas --js 
shift-insert(windows) or CMD-V(os x)
paste it
EOF
```

The output is a nodejs module

You can run it directly.

```bash
cat <<"EOF" | curlas --js | node | more
curl 'http://google.com/' -H 'Upgrade-Insecure-Requests: 1' \
-H 'User-Agent: Safari/537.36' \
-H 'X-DevTools-Emulate-Network-Conditions-Client-Id: \
1CC52EDD123227D4963363DF922B8CE8' --compressed
EOF
```

Or save the module into your spider project.

```bash
cat <<"EOF" | curlas --js  > ./_getList.js
curl http://localhost:8000 \
-H 'Content-Type: json' \
-H 'cookie: tk=abcd' \
-d '{"foo":"bar"}'
EOF
```

## Support language

- [x] sh
- [x] nodejs
- [ ] java
- [ ] python




