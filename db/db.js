const mysql = require('mysql');
let connection = mysql.createConnection({
  host: 'sql9.freemysqlhosting.net',
  user: 'sql9226608',
  password: 'BsNNEbjgS2',
  database: 'sql9226608'
})









connection.connect();
module.exports = connection;