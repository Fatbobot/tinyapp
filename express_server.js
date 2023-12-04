// App setup : Importation and Declaration.
const express = require("express");
let cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1); // trust first proxy
app.use(
  cookieSession({
    name: "session",
    keys: ["key"],
  })
);
app.use(function (req, res, next) {
  req.sessionOptions.maxAge = req.session.maxAge || req.sessionOptions.maxAge;
  next();
});
// Import helper functions and databases
const { urlsForUser, getUserByEmail, generateString } = require("./helpers");
const { urlDatabase, users } = require("./databases");

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
  };
  // If logged in, redirect to main page. Else prompt to log-in
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

//Register to create user object if checks are passed.
app.post("/register", (req, res) => {
  const userId = generateString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  // Check if password or email registration is empty
  if (!email || !password) {
    res
      .status(400)
      .send("Bad Request: Insufficent characters in Password or Username");
    return;
  }
  // Check if email used to register already exists
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

// Logout, clear cookies, redirect to login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Login user if checks are passed.
app.post("/login", (req, res) => {
  // Use helper function to see if email exists
  const doesEmailExist = getUserByEmail(req.body.email, users);
  // Access logged in users ID if their email exists
  const loggedInUser = users[doesEmailExist];
  // Check if password is correct. If truthy, set cookie. Else send error
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

// Edit existing URL belonging to currentUser
app.post("/urls/:id/edit", (req, res) => {
  const keysOfuserUrls = Object.keys(
    urlsForUser(req.session.user_id, urlDatabase)
  );
  if (keysOfuserUrls.includes(req.params.id)) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    // Edge case if current user edits URL that is not theirs
    res.send("Error: This action is restricted for creator access.");
  }
});

// Delete URL belonging to current User
app.post("/urls/:id/delete", (req, res) => {
  const keysOfuserUrls = Object.keys(
    urlsForUser(req.session.user_id, urlDatabase)
  );
  // Check if URL belongs to Current User
  if (keysOfuserUrls.includes(req.params.id)) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send("Error: insuffucient permissions for this action");
  }
});

// Create new URL for URL index
app.post("/urls", (req, res) => {
  // Check if logged in to create URL
  if (!req.session.user_id) {
    res.send("Please Login or Create a profile to create a new URL");
    return;
  }
  const shortUrl = generateString();
  urlDatabase[shortUrl] = {
    shortUrl: shortUrl,
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${shortUrl}`);
});

// Access for longUrl
app.get("/u/:id", (req, res) => {
  const urlId = req.params.id;
  if (urlDatabase[urlId]) {
    const longURL = urlDatabase[urlId].longURL;
    res.redirect(longURL);
  } else {
    res.send("Error: Short url does not exist");
  }
});

// Access for form to create new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  //Check if logged in to create new URL
  if (!req.session.user_id) {
    res.render("login", templateVars);
  } else {
    res.render("urls_new", templateVars);
  }
});

// Registration form to create new User
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
  };

  // If user is already logged in, redirect to main page.
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

// Main page with index of current users URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    // only show URLs that belong to current user
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  // Check if logged in
  if (!req.session.user_id) {
    res.send(
      "Error: This page is restricted for User access. Please Login to continue."
    );
  } else {
    res.render("urls_index", templateVars);
  }
});

// Display information for url ID
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  const keysOfuserUrls = Object.keys(
    urlsForUser(req.session.user_id, urlDatabase)
  );
  // Check if logged in
  if (!req.session.user_id) {
    res.send(
      "Error: This page is restricted for User access. Please Login to continue."
    );
    return;
  }
  // Check if url modification belongs to currrent User
  if (keysOfuserUrls.includes(req.params.id)) {
    res.render("urls_show", templateVars);
  } else {
    res.send("Error: This page is restricted for creator access.");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
