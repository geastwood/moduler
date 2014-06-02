var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}

var bodyParser = require('body-parser');
var methodOverride = require('method-override');

app.use(bodyParser());
app.use(methodOverride());
app.use(app.router);
app.use(logErrors);
app.use(errorHandler);

var server = app.listen(8888, function() {
    console.log('Listening on port %d', server.address().port);
});

app.get('/', function(req, res) {
    res.render('index');
});
