'use strict';

let express = require('express')
let bodyParser = require('body-parser')
let app = express()

app.use(bodyParser.text())
app.use(bodyParser.json())

app.use('/', express.static('public'))

app.post('/api/text', (req, res) => {
    console.log('got request to text endpoint')
    res.send(`Hello back from server, you sent '${req.body}'`)
})

app.post('/api/json', (req, res) => {
    console.log('got request to json endpoint')
    console.log(req.body)
    res.send({pong: req.body.ping})
})

app.listen(3000, () => console.log('test server running on localhost:3000'))
