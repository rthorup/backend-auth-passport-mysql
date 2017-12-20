const mysql = require('mysql');
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',

  password: 'drag01n1',
  database: 'passport'
})









connection.connect();
module.exports = connection;