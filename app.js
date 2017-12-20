'use strict'
const express = require('express');
const fs = require('fs');
const hbs = require('hbs');
const bodyParser = require('body-parser');
//needed to help validate user input, check, sanitize etc.
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
    min: 4,
    max: 45
  }).withMessage('Username must be 4-45 characters.'),
  check('email').isEmail().withMessage('Invalid email address'),
  check('email').isLength({
    min: 6,
    max: 100
  }).withMessage('Email address must be between 4-100 characters.'),
  check('password').isLength({
    min: 8,
    max: 30
  }).withMessage('Password must be between 8-30 characters.'), check("password").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i").withMessage("Password must contain one lowercase character, one uppercase character, a number, and a special character."), check('passwordverify').isLength({
    min: 8,
    max: 30
  }).withMessage('Password must be between 8-100 characters long.'),
  check('passwordverify').custom((value, {
    req
  }) => value === req.body.password).withMessage('Passwords do not match')
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
  // ATat123!
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