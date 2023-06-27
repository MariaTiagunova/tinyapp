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
const generateRandomString = function() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};
const getUserByEmail = function(email) {
  for (let user in users) {
    if (users[user].email === email)
      return users[user];
  }
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



app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]};
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
  let submittedEmail = req.body.email;
  let submittedPassword = req.body.password;
  let user = getUserByEmail(submittedEmail);
  if (!user) {
    return res.status(403).send("Email cannot be found");
  }
  if (submittedPassword !== user.password) {
    return res.status(403). send("Incorrect password");
  }
  res.cookie("user_id", user.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) { // if the user is logged in, they will be redirected to the /urls page
    res.redirect("/urls")
  } else { // if user is not logged in, the registration page will be rendered
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Checks if the e-mail already registered
  if (getUserByEmail(submittedEmail)) {
    return res.status(400).send("Email already registered");
  }
  // Checks if the e-mail or password are not empty strings
  if (!submittedEmail || !submittedPassword) {
    return res.status(400).send("Please include both a valid email and password");
  }
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie('user_id', userID); // set cookie for user using their id
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) { //if the user is logged in, they will be redirected to the /urls page
    res.redirect("/urls")
  } else { // if user is not logged in, the login page will be rendered
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID]
    };
  res.render("login", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});