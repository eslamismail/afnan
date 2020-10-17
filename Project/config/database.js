var mysql = require("mysql");
var connection = mysql.createConnection({
  multipleStatements: true,
  host: "localhost",
  user: "root",
  password: "samyotech@123456",
  database: "saudi_db",
  charset: "utf8",
});
connection.connect(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Database connected");
  }
});
module.exports = connection;
