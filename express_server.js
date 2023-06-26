const express = require("express");
const app = express();
const PORT = 8080; // default port
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Contains ids(short URLs) and corresponding long URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Contains user data
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
};

// Generates random string with 6 symbols for short URL id and User id
function generateRandomString() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  return randomString;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie('user_id', userID)
  console.log(users);
  res.redirect("/urls");
  });

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]
  const templateVars = { 
    user: users[userID],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"]
  const templateVars = { 
    user: users[userID]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"]
  const templateVars = { 
    user: users[userID],
    id: req.params.id,
    longURL: urlDatabase.id };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); 
  urlDatabase[shortURL] = req.body.longURL; // id-longURL saved to the urlDatabase
  res.redirect(`/urls/${shortURL}`); // redirection to /urls/:id
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; // req.params.id = shortUrl from urlDatabase
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => { // delete urls
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => { // edit long url
  const id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => { 
// set a cookie named username to the value submitted in the request body
const userID = req.cookies["user_id"]
  const templateVars = { 
    user: users[userID]
  }
res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  }
  res.render("register", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});