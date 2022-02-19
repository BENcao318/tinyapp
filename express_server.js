const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aj48lW" },
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
    urls: urlsForUser(req.cookies["user_id"]),
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

/*
show the urls_show for corresponding shortURL
*/
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
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
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

/*
Create new URLs and POST responses
*/
app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    //if the user is logged into the page
    urlDatabase[generateRandomString()] = {
      longURL: prefixHttp(req.body.longURL),
      userID: req.cookies["user_id"],
    };

    console.log(req.body); // Log the POST request body to the console
    res.redirect("urls");
  } else {
    res.redirect("/login");
  }
});

/*
delete the coresponding shortURL in the database
*/
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlsForUser(req.cookies["user_id"])[req.params.shortURL]) {
    // check if user is logged in when deleting the shortURL
    delete urlDatabase[req.params.shortURL];
  }
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
  if (urlsForUser(req.cookies["user_id"])[req.params.shortURL]) {
    // check if the user is logged in when trying to edit the longURL
    urlDatabase[req.params.shortURL].longURL = prefixHttp(
      req.body.submittedURL
    );
  }
  res.redirect("/urls");
  res.end();
});

/*
login submit button, use cookie to set the current user_id 
*/
app.post("/login", (req, res) => {
  let username = undefined;
  let userID = undefined;
  /*
    check email in users
  */
  if ((username = checkExistingEmail(req.body.email))) {
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
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = {
      id: randomUserID,
      password: hashedPassword,
      email: req.body.email,
    };
    users[randomUserID] = newUser;
    console.log(req.body.password)
    console.log(newUser.password);
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
  if (bcrypt.compareSync(password, users[username].password)) {
    //Check user's password in the database
    return users[username].id;
  }
  return false;
}

function prefixHttp(webAddress) {
  if (!webAddress.includes("http://")) {
    return `http://${webAddress}`;
  }
  return webAddress;
}

function urlsForUser(id) {
  let userURLDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLDatabase;
}
