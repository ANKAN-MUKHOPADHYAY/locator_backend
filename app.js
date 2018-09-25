var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');

var verifyToken = require('./routes/auth/verifyToken');
var index = require('./routes/index');
var adminOps = require('./routes/adminoperations');
var searchOps = require('./routes/search/searchOperations');
var userOps = require('./routes/user/userOperations');
var instOps = require('./routes/institute/instituteOperations');
var recommendOps = require('./routes/recommendation/recommendOperation');
var uploadOps = require('./routes/upload/uploadOperations');
var salesOps = require('./routes/sales/salesOperations');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({resave: true, saveUninitialized: true, secret: 'SOMERANDOMSECRETHERE', cookie: { maxAge: 60000 }}));
app.use(cors());
app.use('/api/v1', index);
//app.use('/api/v1/admin', adminOps);
//app.use('/api/v1/search', searchOps);

var apiRoutes = express.Router();
apiRoutes.use(bodyParser.urlencoded({ extended: true }));
apiRoutes.use(bodyParser.json());

//route middleware to verify a token 
apiRoutes.use(verifyToken);

app.use('/user', userOps);
apiRoutes.use('/admin', adminOps);
apiRoutes.use('/search',searchOps);
apiRoutes.use('/institute', instOps);
app.use('/recommend',recommendOps);
app.use('/uploadOps', uploadOps);
app.use('/sales', salesOps);

app.use('/api/v1', apiRoutes);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


app.use(function(req, res, next) { //allow cross origin requests
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
