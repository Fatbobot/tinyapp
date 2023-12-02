const express = require("express");
let cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.post("/register", (req, res) => {
  const userId = generateString();
  users[`user-${userId}`] = {
    id: userId,
    email: req.body.email,
    password: req.body.password,
  };
  const currentUser = users[`user-${userId}`];
  if (currentUser.email.length === 0 || currentUser.password.length === 0) {
    res
      .status(400)
      .send("Bad Request: Insufficent characters in Password or Username");
  }
  for (const userObj in users) {
    const databaseUser = users[userObj];
    if (databaseUser.email === currentUser.email) {
      res.status(400).send("Bad Request: Email already in use.");
    }
  }
  res.cookie("user_id", users[`user-${userId}`]);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  console.log(urlDatabase);
  res.redirect("/urls");
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.post("/urls", (req, res) => {
  const shortUrl = generateString();
  urlDatabase[shortUrl] = req.body.longURL;
  console.log(req.body);
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"],
  };
  res.render("urls_new", templateVars);
});
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"],
  };
  res.render("urls_register", templateVars);
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"],
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
