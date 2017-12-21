'use strict'
const express = require('express');
const fs = require('fs');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MySQLStore = require('express-mysql-session')(session);
//needed to help validate user input, check, sanitize etc.
const {
  check,
  validationResult
} = require('express-validator/check')

const saltRounds = 10;
const db = require('./db/db.js')

let app = express();
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/static'));
//need to read encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

var options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'drag01n1',
  database: 'passport'
};

var sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'asdhfasldfkahsf',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));

passport.use(new LocalStrategy(function(username, password, done) {
  db.query('SELECT id, password FROM users WHERE username = ?', username, function(err, results, fields) {
    if (err) {
      console.log('not found');
      done(err, false)
    } else if (results.length === 0) {
      console.log('user not found');
      done(null, false, {
        message: 'Username and password do not match'
      })
    } else {
      const hash = results[0].password.toString();
      // console.log(hash);
      // console.log(password);
      bcrypt.compare(password, hash, function(err, res) {
        if (res === true) {
          done(null, {
            user: results[0].id
          })
        } else {
          done(null, false)
        }
      });
    }
  });
}));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());


hbs.registerPartials(__dirname + '/views/partial');
// homepage
app.get('/', (req, res) => {
  res.render('home.hbs', {
    title: 'Home Page',
    paragraph: 'we are doing shit that I dont understand',
  });
});

app.get('/register', isLoggedin(), (req, res) => {
  res.render('register.hbs', {});
});

app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/login')
});

app.get('/profile', isAuthenticatedMiddleware(), (req, res) => {
  // console.log(req.user);
  console.log(req.user);
  // console.log(req.isAuthenticated());
  db.query('SELECT * FROM users WHERE id = ?', req.user.user, function(err, results, fields) {
    let username = results[0].username
    console.log(username);
    let email = results[0].email
    console.log(email);
    res.render('profile.hbs', {
      username: username,
      email: email
    });
  })

});

app.get('/login', (req, res) => {
  res.render('login.hbs', {
    message: req.flash('error')
  })
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

app.post('/register', [
  check('username').isLength({
    min: 4,
    max: 45
  }).withMessage('Username must be 4-45 characters.'),
  check('username').matches(/^[a-zA-Z0-9]([a-zA-Z0-9_])+$/i).withMessage('Username can contain letters, numbers, or underscores.'),
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
    password = req.body.password

  bcrypt.hash(password, saltRounds, function(err, hash) {
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], function(err, results, fields) {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          res.render('register', {
            heading: "Registration Failed",
            error: 'Username or Email is already taken.'
          })
        } else {
          res.render('register', {
            heading: "Registration Failed",
            error: 'OH boy. Better let the dumbass who wrote this know'
          })
        }
      } else {
        db.query('SELECT LAST_INSERT_ID() as user', function(err, results, fields) {
          if (err) {
            res.send('hey, database broken. whoops')
          } else {
            console.log(results);
            req.login(results[0], function(err) {
              res.redirect('/profile')
            })
          }
        })
      }

    })
  });
  // res.send('working')
})

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null, id)
});

function isAuthenticatedMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      //moves on to the next part of the function.
      next();
    } else {
      res.redirect('/login')
    }
  }
}

function isLoggedin() {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      res.send('You are already logged in')
    } else {
      next();
    }
  }
}
app.listen(3001, () => {
  console.log('listening on port 3001');
});