const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const {      
  getUserByEmail,  
  urlsForUser,
  generateRandomID,
  generateRandomString,
  encryptID,
  decryptID
} = require("./helpers")

//userDatabase
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    hashedPassword: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "aJ48lW": {
    id: "aJ48lW", 
    email: "test@test.ca", 
    hashedPassword: bcrypt.hashSync("123", 10)
  }
};

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  },
  i3BoGw: {
    longURL: "https://www.google.com",
    userID: "aJ48kW"
}
};



app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}))

app.get("/", (req, res) => {
  const encryptedID = req.session.user_id;
  if(encryptedID) {
    res.redirect("/urls");
  } else {
    res.status(403);
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const encryptedID = req.session.user_id;
  const decryptedID = decryptID(encryptedID);
  if(encryptedID) {
    const templateVars = { 
      urls: urlDatabase, 
      user: users[decryptedID],
      users
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403);
    res.redirect("/login");
  }
  });

app.post("/urls", (req, res) => {
  const encryptedID = req.session.user_id;
  const decryptedID = decryptID(encryptedID);
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, userID: decryptedID};
  templateVars = {
    urls: urlDatabase,
    user: users[decryptedID],
    users
  }
  res.render("urls_index", templateVars);
});
  

app.get("/urls/new", (req, res) => {
  const encryptedID = req.session.user_id;
  const decryptedID = decryptID(encryptedID);
  const templateVars = {
    user: users[decryptedID]
  };
  if(decryptedID in users) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const encryptedID = req.session.user_id;
  const decryptedID = decryptID(encryptedID);
  const shortURL = req.params.shortURL;  
  if(urlsForUser(decryptedID, shortURL, urlDatabase)) {
    const templateVars = { 
      shortURL: shortURL, 
      longURL: urlDatabase[shortURL].longURL,
      user: users[decryptedID]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400);
    res.send("Access denied, URL not associated with this account.")
  }
});
 

app.get("/urls/:shortURL/delete", (req, res) => {
  const encryptedID = req.session.user_id;
  const decryptedID = decryptID(encryptedID);
  const shortURL = req.params.shortURL;  
  if(urlsForUser(decryptedID, shortURL, urlDatabase)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send("Access denied, URL not associated with this account.")
  };
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const encryptedID = req.session.user_id;
  const decryptedID = decryptID(encryptedID);
  const shortURL = req.params.shortURL;  
  if(urlsForUser(decryptedID, shortURL, urlDatabase)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send("Access denied, URL not associated with this account.")
  }; 
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  res.redirect("/urls");
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const encryptedID = req.session.user_id;
  const decryptedID = decryptID(encryptedID);
  const shortURL = req.params.shortURL;
  if(urlsForUser(decryptedID, shortURL, urlDatabase)) {
    res.redirect("/urls/:shortURL")
  } else {
    res.status(400);
    res.send("Cannot edit, URL not associated with this account.")
  };
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const encryptedID = req.session.user_id;
  if(encryptedID) {
    res.redirect("/urls");
  } else {
    const decryptedID = decryptID(encryptedID);
    const templateVars = { 
      urls: urlDatabase, 
      user: users[decryptedID]
    };
    res.render("user_registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  const newUserID = generateRandomID();
  const password = req.body.password
  const newUser = {
    user_id: newUserID,
    email: req.body.email,
    hashedPassword: bcrypt.hashSync(password, 10)
  }
  if(!newUser.email && !password) {
    res.status(400);
    res.send('Invalid email and password provided.');
  }
  if(!newUser.email) {
    res.status(400);
    res.send('Invalid email provided.');
  }
  if(!password) {
    res.status(400);
    res.send('Invalid password provided.');
  }
  if(users[getUserByEmail(newUser.email, users)]) {
    res.status(400);
    res.send('An account associated with this email address already exists.');
  }
  users[newUserID] = newUser;
  req.session.user_id = encryptID(newUserID);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const encryptedID = req.session.user_id;
  const decryptedID = decryptID(encryptedID);
  const templateVars = { 
    urls: urlDatabase, 
    user: users[decryptedID]
  };
  res.render("user_login", templateVars);
});

app.post("/login", (req, res) => {  
  const userEmail = req.body.email;
  const userID = getUserByEmail(userEmail, users); 
  const password = req.body.password;
  const encryptedID = encryptID(userID);
  const decryptedID = decryptID(encryptedID);
  const userInfo = {
    email: userEmail,
    hashedPassword: users[decryptedID].hashedPassword,
  }
  
  if(!userID) {
    res.status(403);
    res.send('Invalid email provided.');
  }
  if(bcrypt.compareSync(password, userInfo.hashedPassword)) {
    req.session.user_id = encryptedID;
    res.redirect("/urls");    
  } else {
    res.status(403);
    res.send('Invalid password provided.');
  } 
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = {urlDatabase};