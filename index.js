const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const Lookbook = require('./lib/lookbook');

let app = express();

app.set('port', (process.env.PORT || 5001));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/top', (req, res) => {
    var stream = Lookbook.getLooks('top');
    stream.pipe(res);
});

app.get('/look/:id', (req, res) => {
    console.log(req);
    var stream = Lookbook.getLook(req.params.id);
    stream.pipe(res);
});

// spin spin sugar
app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'))
});