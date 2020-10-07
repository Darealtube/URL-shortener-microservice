'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongo = require("mongodb").MongoClient;
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var dns = require('dns');
var validUrl = require('valid-url');
var regex = /(www)(.)(\w+|\d+|\w+\d+)(.)(\w+)/gm;

var port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true,useUnifiedTopology: true});
app.use(cors());

mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

let urlSchema = new Schema({
        originalURL: String,
        shortURL: {type: String}
        });
const Model = mongoose.model("Model", urlSchema);



// your first API endpoint... 
app.post('/api/shorturl/new', (req, res) => {
   var url = req.body.url;
    if(validUrl.isUri(url)){
        Model.exists({ originalURL: req.body.url }, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      if(result === false){
          Model.findOneAndUpdate(
        { originalURL: req.body.url },
        { $set: { originalURL: req.body.url, shortURL: Math.floor(Math.random()*100000).toString()} },
        { upsert: true, new: true }, function(err,data){
        if(err) console.log(err)
          return res.json({original_url: data.originalURL, short_url: data.shortURL});
          }   
        );
      }
  
    if(result === true){
        Model.findOne(
      { originalURL: req.body.url, shortURL: { $exists: true } },
        function(err,data){
            if(err) console.log(err)
          return res.json({original_url: data.originalURL, short_url: data.shortURL});
        }   
      );
      }
    }
  });
            
    } else {
        res.json({error: 'Invalid URL (add https:// and try again...)'});
    }
});

app.post('/api/shorturl/red', (req,res)=>{
    var req_url = req.body.numb;
   Model.exists({shortURL: req.body.numb}, function(err, data){
      if(err) res.send(err)
     
     if(data === true){
       Model.findOne({shortURL: req.body.numb},function(err,doc){
         console.log(doc.orgiginalURL)
         res.redirect(doc.originalURL)
       })
     }
     
     if(data === false){
       res.json({error: 'Invalid URL'});
     }
     
    })
  })


app.listen(port, function () {
  console.log('Node.js listening ...');
});

console.log(mongoose.connection.readyState);