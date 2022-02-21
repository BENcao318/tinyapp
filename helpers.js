const bcrypt = require('bcrypt');

function getUserByEmail(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
}

function checkPassword(username, password, database) {
  if (bcrypt.compareSync(password, database[username].password)) {
    //Check user's password in the database
    return database[username].id;
  }
  return false;
}

function prefixHttp(webAddress) {
  if (!webAddress.includes("http://")) {
    return `http://${webAddress}`;
  }
  return webAddress;
}

function urlsForUser(id, urlDatabase) {
  let userURLDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLDatabase;
}


module.exports = {
  getUserByEmail,
  checkPassword,
  prefixHttp,
  urlsForUser,
}