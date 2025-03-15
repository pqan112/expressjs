### req.params

- /:id

```
const id = req.params.id
```

### req.query

- abc?code="js"

```
const code = req.query.code
```

### req.header vs req.headers

```
✅ const tk = req.header('authorization') // 'Bearer ...'
✅ const tk = req.header('Authorization') // 'Bearer ...'
```

```
✅ const tk = req.headers.authorization // 'Bearer ...'
❌ const tk = req.headers.Authorization // undefined
```
