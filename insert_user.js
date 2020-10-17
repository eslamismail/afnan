var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = [{ name: "Amit", address: "Highway 37" },
				  { name: "Company Inc", address: "Highway 38" },
				  { name: "sharma", address: "Highway 39" },
				  { name: "nanda", address: "Highway 370" },
				  { name: "nagar", address: "Highway 3755" }];
  dbo.collection("customers").insertMany(myobj, function(err, res) {
    if (err) throw err;
      console.log(res);
    dbo.close();
  });

});