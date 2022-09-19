const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const e = require("express");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser())

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

};


function generateRandomString() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( var i = 0; i <= 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function checkEmail(string) {
  for (let user in users) {
    let email = users[user];
    console.log(email['email'])
    console.log(string)
    if (string === email['email']){
      return true
    };
  };
  return false
};

// req -- params, body, query, headers
// /url/:id. /urls/1  -----params
// body is any form data
// query is url query params. Ex /urls/1?text=now
app.post("/urls", (req, res) => {
  const key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${key}`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
});

app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect('/urls')
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  delete users[req.cookies["user_id"]]
  res.redirect('/urls')
});

app.post('/register', (req, res) => {
  if (checkEmail(req.body.email)) {
    res.status(404).send('Email already in use')
  }
  const cookieId = req.cookies["user_id"]
  const key = generateRandomString();
  users[key] = {
    id: key,
    email: req.body.email,
    password: req.body.password,
  }
  if (req.body.email === '') {
    res.status(404).send('Eror 404: No email submitted')
  };
  if (req.body.password === '') {
    res.status(404).send('Eror 404: No password submitted')
  }
  
  res.cookie('user_id', key)
  res.redirect('/urls')
});

app.get('/login', (req, res) => {
  const cookieId = req.cookies["user_id"]
  const user = users[cookieId]
  templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render('urls_login', templateVars)
});

app.get('/register', (req, res) => {
  const cookieId = req.cookies["user_id"]
  const user = users[cookieId]
  const templateVars = { 
    urls: urlDatabase,
    user: user
  };
  res.render('urls_register', templateVars)
})

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id] 
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const cookieId = req.cookies["user_id"]
  const user = users[cookieId]
  
  const templateVars = { 
    urls: urlDatabase,
    user: user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const cookieId = req.cookies["user_id"]
  const user = users[cookieId]
  const templateVars = { 
    user: user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const { id } = req.params; // object destructuring  -->> const id = req.params.id
  const cookieId = req.cookies["user_id"]
  const user = users[cookieId]
  const templateVars = { 
    id, 
    longURL: urlDatabase[id],
    user: user
  };
  res.render("urls_show", templateVars);
});

