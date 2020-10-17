var con=require('./config/database')
var cm=require('./model/common')

var express=require("express")
var app=express()

var bodyparser=require("body-parser")
var routes=require('./routes')
app.use(bodyparser.json());
  app.use(routes);

var user=require('./routes/user.js');
var category=require('./routes/category.js');
var job=require('./routes/job.js');
var gallery=require('./routes/gallery.js');
var rating=require('./routes/rating.js');
var notification=require('./routes/notification.js');
var ticket=require('./routes/ticket');
app.use('/',user);
app.use('/',category);
 app.use('/',job);
 app.use('/',gallery);
 app.use('/',rating);
 app.use('/',notification);
 app.use('/',ticket);

app.listen(4006);


