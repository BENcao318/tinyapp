const express = require("express");
const methodOverride = require("method-override");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const {
  getUserByEmail,
  checkPassword,
  prefixHttp,
  urlsForUser,
} = require("./helpers");

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
app.use(
  cookieSession({
    name: "session",
    keys: ["Sxo3=T%?3]MGYi:"],
  })
); // Use Cookie Session to parse the cookie data
app.use(methodOverride('_method'));

/*
Page renderers
*/
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    username: req.session.user_id,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.session.user_id,
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
    username: req.session.user_id,
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
    username: req.session.user_id,
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.session.user_id,
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
  if (req.session.user_id) {
    //if the user is logged into the page
    urlDatabase[generateRandomString()] = {
      longURL: prefixHttp(req.body.longURL),
      userID: req.session.user_id,
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
app.delete("/urls/:shortURL", (req, res) => {
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) {
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
app.put("/urls/:shortURL", (req, res) => {
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) {
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
  if ((username = getUserByEmail(req.body.email, users))) {
    if ((userID = checkPassword(username, req.body.password, users))) {
      req.session.user_id = userID;
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
  req.session = null;
  res.redirect("/urls");
});

/*
Register post, create new user profile based on the form input
*/
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send("400: Email or Password cannot be empty.");
  } else if (getUserByEmail(req.body.email, users)) {
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
    req.session.user_id = newUser.id;
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
