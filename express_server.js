const express = require("express");
let cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
  name: 'session',
  keys: ['key']
}))
app.use(function (req, res, next) {
  req.sessionOptions.maxAge = req.session.maxAge || req.sessionOptions.maxAge
  next()
})
//Database storing Urls with creator ID
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};
const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
    
  },
  testid: {
    id: "testid",
    email: "123@123.com",
    password: bcrypt.hashSync("123", 10),
  },
};

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateString = function () {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const getUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return userId;
    }
  }
  return undefined;
};

const urlsForUser = (id)=> {
  const userUrlDatabase = {};
  for (const urlId in urlDatabase)
    if (id === urlDatabase[urlId].userID) {
      userUrlDatabase[urlId] = urlDatabase[urlId]
    }
  return userUrlDatabase;
};

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
  };
  //dry
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.render("login", templateVars);
  }
});
app.post("/register", (req, res) => {
  const userId = generateString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10)

  if (!email || !password) {
    res
      .status(400)
      .send("Bad Request: Insufficent characters in Password or Username");
    return;
  }
  if (getUserByEmail(email, users)) {
    res.status(400).send("Bad Request: Email already in use.");
    return;
  }
  users[userId] = {
    id: userId,
    email: email,
    password: password,
  };
  req.session.user_id = userId;
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});
//DRY THIS CODE
app.post("/login", (req, res) => {
  const doesEmailExist = getUserByEmail(req.body.email, users);
  const loggedInUser = users[doesEmailExist];
  if (loggedInUser) {
    if (bcrypt.compareSync(req.body.password, loggedInUser.password)) {
      req.session.user_id = loggedInUser.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Forbidden: Incorrect  password.");
      return;
    }
  } else {
    res.status(401).send("Email not found");
    return;
  }
});
app.post("/urls/:id/edit", (req, res) => {
  const keysOfuserUrls = Object.keys(urlsForUser(req.session.user_id))
  if (keysOfuserUrls.includes(req.params.id)) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.send("Error: This action is restricted for creator access.");
  }
});
app.post("/urls/:id/delete", (req, res) => {
  const keysOfuserUrls = Object.keys(urlsForUser(req.session.user_id))
  if (keysOfuserUrls.includes(req.params.id)) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send("Error: This action is restricted for creator access.");
  }
});
app.get("/u/:id", (req, res) => {
  const urlId = req.params.id;
  if (urlDatabase[urlId]) {
    const longURL = urlDatabase[urlId].longURL;
    res.redirect(longURL);
  } else {
    res.send("Error: Short url does not exist");
  }
});
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("Please Login or Create a profile to create a new URL");
    return;
  }
  const shortUrl = generateString();
  urlDatabase[shortUrl] = {
    "shortUrl" : shortUrl,
    "longURL" : req.body.longURL,
    "userID" : req.session.user_id
  }
  res.redirect(`/urls/${shortUrl}`);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!req.session.user_id) {
    res.render("login", templateVars);
  } else {
    res.render("urls_new", templateVars);
  }
});
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
  };
  //dry
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_register", templateVars);
  }
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id],
  };
  if (!req.session.user_id) {
    res.send("Error: This page is restricted for User access. Please Login to continue.");
  } else {
    res.render("urls_index", templateVars);
  }
});
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  const keysOfuserUrls = Object.keys(urlsForUser(req.session.user_id))
  if (!req.session.user_id) {
    res.send("Error: This page is restricted for User access. Please Login to continue.");
    return;
  }
  if (keysOfuserUrls.includes(req.params.id)) {
    res.render("urls_show", templateVars);
  } else {
    res.send("Error: This page is restricted for creator access.");
  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
