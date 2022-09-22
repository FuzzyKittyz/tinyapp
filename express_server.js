const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const checkValue = require('./helpers');

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

}));// cookie encryption

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {

};// for created urls

const users = {

};// for created users

let generateRandomString = function() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i <= 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};// gives you the 6 char string for user cookie and short url


const urlsForUser = function(id) {
  let accObj = {
  };
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      accObj[urlDatabase[url].key] = urlDatabase[url];
    }
  }
  return accObj;
};// checks urls for specific users 

// req -- params, body, query, headers
// /url/:id. /urls/1  -----params
// body is any form data
// query is url query params. Ex /urls/1?text=now
app.post("/urls", (req, res) => {
  const cookieId = req.session.user_id;
  const user = users[cookieId];
  const key = generateRandomString();
  if (!user) {
    res.send("<html><body>User does not have premission to create url till they are logged in</body></html>\n");
  } else {
    urlDatabase[key] = {
      longURL: req.body.longURL,
      userID: cookieId,
      key: key,
    };
    res.redirect(`/urls/${key}`);
  }
});// handles post requests on '/urls'

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});// handles the delete button for urls

app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});// handles edit button for urls

app.post('/login', (req, res) => {
  const email = req.body.email;
  const user = checkValue(email, 'email', users);
  if (!checkValue(req.body.email, 'email', users)) {
    res.status(403).send('Email Cannot be Found');
  }

  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send('Password does not match');
  }

  if (checkValue(req.body.email, 'email', users) && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
  }
  res.redirect('/urls');
});// handles the login button and all edge cases when trying to log in

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});//handles logging out 

app.post('/register', (req, res) => {
  if (checkValue(req.body.email, 'email', users)) {
    res.status(403).send('Email already in use');
  }

  const key = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[key] = {
    id: key,
    email: req.body.email,
    password: hashedPassword
  };
  req.session.user_id = key;
  res.redirect('/urls');
});// handles edge cases and register button in /register

app.get('/login', (req, res) => {
  const cookieId = req.session.user_id;
  const user = users[cookieId];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  if (user) {
    res.redirect('/urls');
  }
  res.render('urls_login', templateVars);
});

app.get('/register', (req, res) => {
  const cookieId = req.session.user_id;
  const user = users[cookieId];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  if (user) {
    res.redirect('/urls');
  }
  res.render('urls_register', templateVars);
});// what is sent to the user when they access the /login page

app.get("/u/:id", (req, res) => {
  const cookieId = req.session.user_id;
  const user = users[cookieId];
  const longURL = urlDatabase[req.params.id].longURL;
  if (!user) {
    res.send("<html><body>User is not logged in</body></html>\n");
  }
  if (!urlDatabase[req.params.id]) {
    res.send("<html><body>Id does not exist</body></html>\n");
  } else {
    res.redirect(longURL);
  }
});// what is sent to the user when they acccess a urls page

app.get("/", (req, res) => {
  const cookieId = req.session.user_id;
  const user = users[cookieId];

  if(user) {
    res.redirect('/urls')
  };

  if(!user) {
    res.redirect('/login')
  }
});// accessing just localhost:8080/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});// shows that the server is on and listening to a specific port

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});// provides a json script of the urls database 

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});// sends an html message to /hello

app.get("/urls", (req, res) => {
  const cookieId = req.session.user_id;
  const user = users[cookieId];
  const templateVars = {
    url: urlsForUser(cookieId),
    user: user,
  };
  res.render("urls_index", templateVars);
});// sent to the user when they access /urls

app.get("/urls/new", (req, res) => {
  const cookieId = req.session.user_id;
  const user = users[cookieId];
  const templateVars = {
    user: user,
  };
  if (!user) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});// sent to the user when going to create a new url

app.get("/urls/:id", (req, res) => {
  const { id } = req.params; // object destructuring  -->> const id = req.params.id
  const cookieId = req.session.user_id;
  const user = users[cookieId];
  const templateVars = {
    id,
    urls: urlDatabase,
    user: user
  };
  if (!user) {
    res.send("<html><body>User does not have premission to view this url</body></html>\n")
  }
  res.render("urls_show", templateVars);
});// sent to the user when accessing a url h