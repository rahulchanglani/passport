var express       = require('express');
var app           = express();
var port     = process.env.PORT || 8080;
var bodyParser    = require('body-parser');
var multer        = require('multer'); 
var passport      = require('passport');
var cookieParser  = require('cookie-parser');
var session       = require('express-session');
var mongoose      = require('mongoose');

mongoose.connect('mongodb://localhost/passport-example');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
multer();
app.use(session({
    secret: 'this is the secret',
    resave: true,
    saveUninitialized: true
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

require("./app/app.js")(app);

app.listen(port, function() {
	console.log('APP started on port --' + port);
});