const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


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

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

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
  }
  res.render("urls_new", templateVars);
})

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

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString] = req.body.longURL;
  console.log(req.body);  // Log the POST request body to the console
  res.send("OK");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
})

/*
redirect the page to the corresponding url when pressing the 'Edit' button
*/
app.post("/urls/:shortURL/redirect", (req, res) => {  
  res.redirect(`/urls/${req.params.shortURL}`);
})


app.post("/urls/:shortURL/submit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.submitURL;
  res.redirect('/urls');
  res.end();
})

app.post("/login", (req, res) => {
  res.cookie('user_id', req.body.username)
  res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

/*
Register post, create new user profile based on the form input
*/
app.post("/register", (req, res) => {
  if(!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send('400: Email or Password cannot be empty.')
  } else if(checkExistingEmail(req.body.email)) {
    res.statusCode = 400;
    res.send('400: Email already exist, please provide a new')
  } else {
    const randomUserID = generateRandomString();
    const newUser = {
      id: randomUserID,
      password: req.body.password,
      email: req.body.email,
    }
    users[randomUserID] = newUser; 
    console.log(users)
    res.cookie('user_id', newUser.id);
    res.redirect('/urls');
  }
})

/*
Redirect to the long url address when clicking the short url on short url page
*/
app.get("/u/:shortURL", (req, res) => {           
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = '';
  const length = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(let i = 0; i < length; i++) {
    result += characters.charAt(Math.ceil(Math.random() * characters.length))
  }
  return result;
}

function checkExistingEmail(emailAddress) {
  for(let user in users) {
    if(users[user].email === emailAddress) return true;
  }
  return false;
}