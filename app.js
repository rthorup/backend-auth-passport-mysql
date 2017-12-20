'use strict'
const express = require('express');
const fs = require('fs');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const {
  check,
  validationResult
} = require('express-validator/check')

const db = require('./db/db.js')
let app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

hbs.registerPartials(__dirname + '/views/partial');
app.use(express.static(__dirname + '/static'));
//need to read encoded data
app.use(bodyParser.urlencoded({
  extended: false
}));

// homepage
app.get('/', (req, res) => {
  res.render('home.hbs', {
    title: 'Home Page',
    paragraph: 'we are doing shit that I dont understand',
  });
});

app.get('/register', (req, res) => {
  res.render('register.hbs', {});
});

app.get('/login', (req, res) => {
  res.render('login.hbs', {

  })
})
app.post('/register', [
  check('username').isLength({
    min: 1
  }).withMessage('Username required')
], (req, res) => {
  const err = validationResult(req)
  if (!err.isEmpty()) {
    console.log(err.mapped());
    res.render('register', {
      heading: "Registration Failed",
      errors: err.array()
    })
    return;
  }

  console.log(req.body)
  let username = req.body.username,
    email = req.body.email,
    password = req.body.password,
    passwordVerify = req.body.passwordVerify
  db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], function(err, results, fields) {
    if (err) {
      res.send('oopsie poopsie');
      return;
    }
    console.log(results);
  })
  // res.send('working')
})
app.listen(3001, () => {
  console.log('listening on port 3001');
});