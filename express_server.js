const express = require("express");
const app = express();
const PORT = 8080; // default port
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['catcus'],
  //Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Contains ids(short URLs) and corresponding long URLs
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// Contains user data
const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "12",
  },
};



app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send("Please log in to access your URLs");
  }
  const userURLs = urlsForUser(userID, urlDatabase); //shows only user's URLs
  const templateVars = {
    user: users[userID],
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) { // if the user is not logged in, they will be redirected to the /login page
    res.redirect("/login");
  } else {
    const userID = req.session.user_id;
    const templateVars = {
      user: users[userID]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  // Check if the user is logged in
  if (!userID) {
    return res.status(401).send("Please log in to access your URLs");
  }
  // Check if the URL exists in the database
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found");
  }
  // Check if the user owns the URL
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("You do not have permission to edit this URL");
  }
  const templateVars = {
    user: users[userID],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) { // if the user is not logged in, they will cannot shorten URLs
    return res.send("Please log in to shorten URLs");
  } else {
    const shortURL = generateRandomString(6);
    if (!req.body.longURL) {
      return res.send("Please enter a valid URL");
    }
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userID
    };
    res.redirect(`/urls/${shortURL}`); // redirection to /urls/:id
  }
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Sorry, the short URL you entered is invalid.");
  }
  const longURL = urlDatabase[req.params.id].longURL; // req.params.id = shortUrl from urlDatabase
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => { // edit long url
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const savedURL = urlDatabase[shortURL];
  // Check if the shortURL exists in the urlDatabase
  if (!savedURL) {
    return res.status(404).send("URL not found");
  }
  // Check if the user is logged in
  if (!userID) {
    return res.status(401).send("Please log in to edit URLs");
  }
  // Check if the user owns the URL
  if (savedURL.userID !== userID) {
    return res.status(403).send("You do not have permission to edit this URL");
  }
  if (!req.body.newURL) {
    return res.send("Please enter a valid URL");
  }
  // Update the longURL
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => { // delete urls
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  // Check if the shortURL exists in the urlDatabase
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found");
  }
  // Check if the user is logged in
  if (!userID) {
    return res.status(401).send("Please log in to edit URLs");
  }
  // Check if the user owns the URL
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("You do not have permission to edit this URL");
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  let submittedEmail = req.body.email;
  let submittedPassword = req.body.password;
  let user = getUserByEmail(submittedEmail, users);
  if (!user) {
    return res.status(403).send("Email cannot be found");
  }
  if (!bcrypt.compareSync(submittedPassword, user.password)) {
    return res.status(403). send("Incorrect password");
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/register", (req, res) => {
  if (req.session.user_id) { // if the user is logged in, they will be redirected to the /urls page
    res.redirect("/urls");
  } else { // if user is not logged in, the registration page will be rendered
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Checks if the e-mail already registered
  if (getUserByEmail(submittedEmail, users)) {
    return res.status(400).send("Email already registered");
  }
  // Checks if the e-mail or password are not empty strings
  if (!submittedEmail || !submittedPassword) {
    return res.status(400).send("Please include both a valid email and password");
  }
  const userID = generateRandomString(6);
  users[userID] = {
    id: userID,
    email: submittedEmail,
    password: bcrypt.hashSync(submittedPassword, 10),
  };
  req.session.user_id = userID; // set cookie for user using their id
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) { //if the user is logged in, they will be redirected to the /urls page
    res.redirect("/urls");
  } else { // if user is not logged in, the login page will be rendered
    const userID = req.session.user_id;
    const templateVars = {
      user: users[userID]
    };
    res.render("login", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});