const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const findUserByEmail = function(email){
  for(user in users){
    if(users[user].email === email){
      return user;
    }
  }
}

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
const e = require("express");
app.use(cookieParser())

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.render("urls_show", {shortURL, longURL, user : users[req.cookies["user_id"]]});
});

function generateRandomString() {
  return new Array(6).join().replace(/(.|$)/g, function(){return ((Math.random()*36)|0).toString(36)[Math.random()<.5?"toString":"toUpperCase"]();});
}

function generateRandomID() {
  return new Array(8).join().replace(/(.|$)/g, function(){return ((Math.random()*36)|0).toString(36)[Math.random()<.5?"toString":"toUpperCase"]();});
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

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
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});
 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls");
});

app.get("/urls/:shortURL/edit", (req, res) => {
  res.redirect("/urls/:shortURL");
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email
  const userID = findUserByEmail(userEmail);
  res.cookie("user_id", userID )
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
  };
  res.render("user_registration", templateVars);
});

app.post("/register", (req, res) => {
  const newUserID = generateRandomID();
  const newUser = {
    user_id: newUserID,
    email: req.body.email,
    password: req.body.password
  }
  if(!newUser.email && !newUser.password){
    res.status(400);
    res.send('Invalid email and password provided.');
  }
  if(!newUser.email){
    res.status(400);
    res.send('Invalid email provided.');
  }
  if(!newUser.password){
    res.status(400);
    res.send('Invalid password provided.');
  }
  if(users[findUserByEmail(newUser.email)]){
    res.status(400);
    res.send('An account associated with this email address already exists.');
  }

  users[newUserID] = newUser;
  res.cookie("user_id", newUserID);
  res.redirect("/urls");

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});