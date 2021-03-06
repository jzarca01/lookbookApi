const express = require('express');
const path = require('path');
const logger = require('morgan');

const Lookbook = require('./lib/lookbook');

let app = express();

app.set('port', (process.env.PORT || 5001));
app.use(logger('dev'));


app.get('/top', (req, res) => {
    var stream = Lookbook.getLooks('top', req.query.gender);
    stream.pipe(res);
});

app.get('/top/:place', (req, res) => {
    var stream = Lookbook.getLooks('top', req.query.gender, req.params.place);
    stream.pipe(res);
});


app.get('/hot', (req, res) => {
    var stream = Lookbook.getLooks('hot', req.query.gender);
    stream.pipe(res);
});

app.get('/hot/:place', (req, res) => {
    var stream = Lookbook.getLooks('hot', req.query.gender, req.params.place);
    stream.pipe(res);
});


app.get('/new', (req, res) => {
    var stream = Lookbook.getLooks('new', req.query.gender);
    stream.pipe(res);
});

app.get('/new/:place', (req, res) => {
    var stream = Lookbook.getLooks('new', req.query.gender, req.params.place);
    stream.pipe(res);
});


app.get('/look/:id', (req, res) => {
    var stream = Lookbook.getLook(req.params.id);
    stream.pipe(res);
});


app.get('/categories/:type', (req, res) => {
    var stream = Lookbook.getCategories(req.params.type);
    stream.pipe(res);
})

app.get('/category/:type', (req, res) => {
    var stream = Lookbook.getLooksInCategory(req.params.type, req.query.gender);
    stream.pipe(res);
})

app.get('/brand/:name', (req, res) => {
    var stream = Lookbook.getBrand(req.params.name);
    stream.pipe(res);
})

app.get('/user/:id', (req, res) => {
    var stream = Lookbook.getUser(req.params.id);
    stream.pipe(res);
})

// spin spin sugar
app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'))
});