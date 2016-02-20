'use strict';

let express = require('express')
let app = express()

app.use('/', express.static('public'))

app.listen(3000, () => console.log('test server running on localhost:3000'))
