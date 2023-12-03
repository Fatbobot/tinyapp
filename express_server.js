const express = require("express");
let cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  testid: {
    id: "testid",
    email: "123@123.com",
    password: "123",
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
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  //dry
  if (req.cookies["user_id"]) {
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

  // const currentUser = users[`user-${userId}`];
  // if (currentUser.email.length === 0 || currentUser.password.length === 0) {
  //   res
  //     .status(400)
  //     .send("Bad Request: Insufficent characters in Password or Username");
  // }
  // for (const userObj in users) {
  //   console.log("userObj", userObj);
  //   const databaseUser = users[userObj];
  //   console.log("databaseUser", databaseUser);
  //   if (databaseUser.email === currentUser.email) {
  //     console.log("if cond ---- currentUSer", currentUser);
  //     console.log("if cond ---- databaseUser", databaseUser);
  //     res.status(400).send("Bad Request: Email already in use.");
  //     return;
  //   }
  // }
  users[userId] = {
    id: userId,
    email: email,
    password: password,
  };
  res.cookie("user_id", userId);
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
      res.cookie("user_id", loggedInUser.id);
      res.redirect("/urls");
    } else {
      res.status(403).send("Forbidden: Incorrect  password.");
      return;
    }
  } else {
    res.status(401).send("Email not found");
    return;
  }
  // for (const userObj in users) {
  //   const databaseUsers = users[userObj];
  //   if (
  //     databaseUsers.email === req.body.email &&
  //     databaseUsers.password === req.body.password
  //   ) {
  //     res.cookie("user_id", databaseUsers);
  //     res.redirect("/urls");
  //   } else {
  //     res.status(403).send("Forbidden: Incorrect username or password.");
  //     return;
  //   }
  // }
});
app.post("/urls/:id/edit", (req, res) => {
  const keysOfuserUrls = Object.keys(urlsForUser(req.cookies["user_id"]))
  if (keysOfuserUrls.includes(req.params.id)) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.send("Error: This action is restricted for creator access.");
  }
});
app.post("/urls/:id/delete", (req, res) => {
  const keysOfuserUrls = Object.keys(urlsForUser(req.cookies["user_id"]))
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
  if (!req.cookies["user_id"]) {
    res.send("Please Login or Create a profile to create a new URL");
    return;
  }
  const shortUrl = generateString();
  urlDatabase[shortUrl] = {
    "shortUrl" : shortUrl,
    "longUrl" : req.body.longURL,
    "userID" : req.cookies["user_id"]
  }
  res.redirect(`/urls/${shortUrl}`);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (!req.cookies["user_id"]) {
    res.render("login", templateVars);
  } else {
    res.render("urls_new", templateVars);
  }
});
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  //dry
  if (req.cookies["user_id"]) {
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_register", templateVars);
  }
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]],
  };
  if (!req.cookies["user_id"]) {
    res.send("Error: This page is restricted for User access. Please Login to continue.");
  } else {
    res.render("urls_index", templateVars);
  }
});
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  const keysOfuserUrls = Object.keys(urlsForUser(req.cookies["user_id"]))
  if (!req.cookies["user_id"]) {
    res.send("Error: This page is restricted for User access. Please Login to continue.");
    return;
  }
  if (keysOfuserUrls.includes(req.params.id)) {
    res.render("urls_show", templateVars);
  } else {
    res.send("Error: This page is restricted for creator access.");
  }

});
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
