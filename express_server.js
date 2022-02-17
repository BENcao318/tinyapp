const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

app.use(bodyParser.urlencoded({ extended: true })); // Use bodyParser to parse the data from request body
app.set("view engine", "ejs"); // Use ejs as the render engine
app.use(cookieParser()); // Use Cookie Parser to parse the cookie data

/*
Page renderers
*/
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["user_id"],
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

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"],
  };
  res.render("login", templateVars);
});

/*
Redirect to the long url address when clicking the short url on short url page
*/
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

/*
POST responses
*/
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString] = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  res.send("OK");
});

/*
delete the coresponding shortURL in the database
*/
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

/*
redirect the page to the corresponding url when pressing the 'Edit' button
*/
app.post("/urls/:shortURL/redirect", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

/*
submit new url in the urls_show page and replace the database shortURL value with new longURL 
*/
app.post("/urls/:shortURL/submit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.submittedURL;
  res.redirect("/urls");
  res.end();
});

/*
login submit button, use cookie to set the current user_id 
*/
app.post("/login", (req, res) => {
  let username = undefined;
  let userID = undefined;
  if ((username = checkExistingEmail(req.body.email))) {
    /*
      check email in users
    */
    if ((userID = checkPassword(username, req.body.password))) {
      res.cookie("user_id", userID);
    } else {
      res.statusCode = 403;
      res.send("403: password or email is not correct");
    }
  } else {
    res.statusCode = 403;
    res.send("403: email cannot be found");
  }

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

/*
Register post, create new user profile based on the form input
*/
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send("400: Email or Password cannot be empty.");
  } else if (checkExistingEmail(req.body.email)) {
    res.statusCode = 400;
    res.send("400: Email already exist, please provide a new email address.");
  } else {
    const randomUserID = generateRandomString();
    const newUser = {
      id: randomUserID,
      password: req.body.password,
      email: req.body.email,
    };
    users[randomUserID] = newUser;
    res.cookie("user_id", newUser.id);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = "";
  const length = 6;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.ceil(Math.random() * characters.length));
  }
  return result;
}

function checkExistingEmail(emailAddress) {
  for (let user in users) {
    if (users[user].email === emailAddress) return user;
  }
  return false;
}

function checkPassword(username, password) {
  if (users[username].password === password) {
    //Check each user in the database
    return users[username].id;
  }
  return false;
}
