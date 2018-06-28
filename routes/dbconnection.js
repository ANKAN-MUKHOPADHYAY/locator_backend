var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'LOCATOR_APP'
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;
