const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const e = require("express");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser())

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {

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

function checkValue(string, key) {
  for (let user in users) {
    let value = users[user];
    if (string === value[key]){
      console.log(user)
      return user 
    };
  };
  return null
};

const urlsForUser = function(id) {
  let accObj = {
  }
  for (let url in urlDatabase){
    if (id === urlDatabase[url].userID){
        accObj[urlDatabase[url].key] = urlDatabase[url]
    }
  }
  return accObj;
};

// req -- params, body, query, headers
// /url/:id. /urls/1  -----params
// body is any form data
// query is url query params. Ex /urls/1?text=now
app.post("/urls", (req, res) => {
  const cookieId = req.cookies["user_id"]
  const user = users[cookieId]
  const key = generateRandomString();
  if (!user) {
    res.send("<html><body>User does not have premission to create url till they are logged in</body></html>\n")
  } else {
    urlDatabase[key] = {
      longURL: req.body.longURL,
      userID: cookieId,
      key: key
    }
    res.redirect(`/urls/${key}`);
  }
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
  if (!checkValue(req.body.email, 'email')) {
    res.status(403).send('Email Cannot be Found')
  }

  if (!checkValue(req.body.password, 'password')) {
    res.status(403).send('Password does not match')
  }

  if (checkValue(req.body.email, 'email') && checkValue(req.body.password, 'password')) {
    res.cookie('user_id', checkValue(req.body.email, 'email'))
  }
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
});

app.post('/register', (req, res) => {
  if (checkValue(req.body.email, 'email')) {
    res.status(403).send('Email already in use')
  }
  const cookieId = req.cookies["user_id"]
  const key = generateRandomString();
  users[key] = {
    id: key,
    email: req.body.email,
    password: req.body.password,
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
  if (user) {
    res.redirect('/urls')
  }
  res.render('urls_login', templateVars)
});

app.get('/register', (req, res) => {
  const cookieId = req.cookies["user_id"]
  const user = users[cookieId]
  const templateVars = { 
    urls: urlDatabase,
    user: user
  };
  if (user) {
    res.redirect('/urls')
  }
  res.render('urls_register', templateVars)
})

app.get("/u/:id", (req, res) => {
  const cookieId = req.cookies["user_id"]
  const user = users[cookieId]
  const longURL = urlDatabase[req.params.id].longURL
  if (!user) {
    res.send("<html><body>User is not logged in</body></html>\n")
  };
  if (!urlDatabase[req.params.id]){
    res.send("<html><body>Id does not exist</body></html>\n")
  } else {
    res.redirect(longURL);
  }
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
    url: urlsForUser(req.cookies["user_id"]),
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
  if (!user) {
    res.redirect('/login')
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const { id } = req.params; // object destructuring  -->> const id = req.params.id
  const cookieId = req.cookies["user_id"]
  const user = users[cookieId]
  const templateVars = { 
    id, 
    urls: urlDatabase,
    user: user
  };
  res.render("urls_show", templateVars);
});

