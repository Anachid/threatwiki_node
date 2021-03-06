var express = require("express");
var time = require('time')(Date);

function load_datapointApi(app, DataPointModel, TagModel, UserModel) {

  // retrieve all
  app.get('/api/datapoint', function (req, res) {
    return DataPointModel.find().populate('tags',['title']).populate('createdBy',['name']).run(function (err, datapoints) {
      if (!err) {
        return res.send(datapoints);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by id
  app.get('/api/datapoint/:id', function (req, res) {
    return DataPointModel.findById(req.params.id).populate('tags',['title']).populate('created by',['name']).run(function (err, datapoint) {
      if (!err) {
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by SOC
  app.get('/api/datapoint/soc/:soc', function (req, res) {
    console.log("DATAPOINT_API:SOC:Search by: " + req.params.soc);
    return DataPointModel.find({soc: req.params.soc}).populate('tags',['title']).populate('createdBy',['name']).run(function (err, datapoint) {
      if (!err) {
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by tag
  app.get('/api/datapoint/tag/:title', function (req, res) {
    // first retrieve tag based on tag_title
    var tag = TagModel.findOne({ title: req.params.title}, function (err, tag) {
      console.log(req.params.title);
      if (!err) {
        console.log("Tag found at " + tag._id);
        // search datapoint for the tag_id that we just found
        return DataPointModel.find({tags: tag._id}).populate('tags',['title']).populate('createdBy',['name']).run(function (err, datapoint) {
          if (!err) {
            console.log("1");
            console.log(datapoint);
            return res.send(datapoint);
          } else {
            console.log("2");
            return console.log(err);
          }
        });
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by location
  app.get('/api/datapoint/location/:Location', function (req, res) {
    console.log("DATAPOINT_API:LOCATION:Search by: " + req.params.Location);
    return DataPointModel.find({'Location.title': req.params.Location}).populate('tags',['title']).populate('createdBy',['name']).run(function (err, datapoint) {
      if (!err) {
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by date
  app.get('/api/datapoint/:date', function (req, res) {
    var d_small = new Date(req.params.date);
    var d_big = new Date(req.params.date);
    d_small.setHours(0,0,0,0);
    d_big.setHours(23,59,59,59);
    return DataPointModel.find({created: {$gte : d_small, $lte : d_big}}).populate('tags',['title']).populate('created by',['name']).run(function (err, datapoint) {
      if (!err) {
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by date after
  app.get('/api/datapoint/date/after/:date', function (req, res) {
    var d_small = new Date(req.params.date);
    d_small.setHours(0,0,0,0);
    return DataPointModel.find({created: {$gte : d_small}}).populate('tags',['title']).populate('created by',['name']).run(function (err, datapoint) {
      if (!err) {
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by date before
  app.get('/api/datapoint/date/before/:date', function (req, res) {
    var d_big = new Date(req.params.date);
    d_big.setHours(23,59,59,59);
    return DataPointModel.find({created: {$lte : d_big}}).populate('tags',['title']).populate('created by',['name']).run(function (err, datapoint) {
      if (!err) {
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by date range
  app.get('/api/datapoint/date/range/:date_start/:date_end', function (req, res) {
    console.log("Search between range");
    console.log("Range start: " + req.params.date_start);
    console.log("Range end: " + req.params.date_end);
    var d_start = new Date(req.params.date_start);
    var d_end = new Date(req.params.date_end);
    d_start.setHours(0,0,0,0);
    d_end.setHours(23,59,59,59);
    return DataPointModel.find({created: {$gte : d_start, $lte : d_end}}).populate('tags',['title']).populate('created by',['name']).run(function (err, datapoint) {
      if (!err) {
        return res.send(soc);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by user
  app.get('/api/datapoint/user/:user_name', function (req, res) {
    // first retrieve user based on user_name
    var user = UserModel.findOne({ name: req.params.user_name}, function (err, user) {
      if (!err) {
        console.log("User found at " + user._id);
        // search datapoint for the user_id that we just found
        return DataPointModel.find({createdBy: user._id}).populate('tags',['title']).populate('createdBy',['name']).run(function (err, datapoint) {
          if (!err) {
            return res.send(datapoint);
          } else {
            return console.log(err);
          }
        });
      } else {
        return console.log(err);
      }
    });
  });

  // create
  app.post('/api/datapoint', function (req, res) {
    var datapoint;
    console.log("POST: ");
    console.log(req.body);

    var date_now = new Date();
    date_now.setTimezone('UTC');

    //Find the user object in the DB that has the same email as the current loggedin google user
    UserModel.findOne({'email':req.session.auth.google.user.email}).run(function (err, user){
      if(!err){
        datapoint = new DataPointModel({
          title: req.body.title,
          description: req.body.description,
          soc: req.body.soc,
          Location: {
            title: req.body.location,
            latitude: req.body.latitude,
            longitude: req.body.longitude
          },
          tags: req.body.tag_list,
          created: date_now,
          modified: date_now,
          //save the _id of the current user in the new datapoint
          createdBy: user._id
        });

        datapoint.save(function (err) {
          if (!err) {
            return console.log("created");
          } else {
            return console.log(err);
          }
        });
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });

  });

  // update
  app.put('/api/datapoint/:id', function (req, res) {
    return DataPointModel.findById(req.params.id, function (err, datapoint) {
      var date_now = new Date();
      date_now.setTimezone('UTC');

      datapoint.title = req.body.title;
      datapoint.description = req.body.description;
      datapoint.soc = req.body.soc;
      datapoint.Location.title = req.body.location;
      datapoint.Location.latitude = req.body.latitude;
      datapoint.Location.longitude = req.body.longitude;
      datapoint.tags = req.body.tag_list;
      datapoint.modified = date_now;

      return datapoint.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.send(datapoint);
      });
    });
  });

  // delete by id
  app.get('/api/datapoint/delete/:id', function (req, res) {
    return DataPointModel.findById(req.params.id, function (err, datapoint) {
      return datapoint.remove(function (err) {
        if (!err) {
          console.log("removed");
          return res.send('');
        } else {
          console.log(err);
        }
      });
    });
  });
}

exports.load_datapointApi = load_datapointApi;
