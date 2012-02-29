var application_root = __dirname,
  routes = require("./routes"),
  model = require("./model"),
  express = require("express"),
  soc_actions = require("./actions/soc_actions"),
  location_actions = require("./actions/location_actions"),
  datapoint_actions = require("./actions/datapoint_actions"),
  tag_actions = require("./actions/tag_actions"),
  mongoose = require('mongoose');

var app = module.exports = express.createServer();

// database
mongoose.connect('mongodb://localhost/namp', function(err) {
    if (err) throw err;
});

// config
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// create model
var createModel = model.createModel();
var SocModel = model.SocModel;
var LocationModel = model.LocationModel;
var DataPointModel = model.DataPointModel;
var TagModel = model.TagModel;

// routes
app.get('/', routes.index);

// import socActions
var socActions = soc_actions.load_socActions(app);
var locationActions = location_actions.load_locationActions(app);
var datapointActions = datapoint_actions.load_datapointActions(app);
var tagActions = tag_actions.load_tagActions(app);

// server listen
app.listen(3000);
console.log("server's up at %d in %s mode", app.address().port, app.settings.env);
