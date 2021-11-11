const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid"); //used to generate random string for generateRandomString()

const PORT = 8080;

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

//old structure
// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

//new structure
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {}; // test code

// const users = {};

// newUser = {
//   id: generateRandomString(),
//   email: email,
//   password: password,
// };

//--------------------------------------------------------------------//
//  Helper Functions
//--------------------------------------------------------------------//

const findUserIDbyEmail = (email) => {
  for (id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return false;
};

const checkUserPassword = (password, email) => {
  const id = findUserIDbyEmail(email);
  if (!id) {
    return false;
  }
  if (users[id].password === password) {
    return id;
  }
  return false;
};

const getUserURLs = (userID) => {
  const userDB = {};
  for (key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      userDB[key] = urlDatabase[key].longURL;
    }
  }
  return userDB;
};

console.log(getUserURLs("aJ48lW"));

//console.log(checkUserPassword("12345", "user@user.com"));

//--------------------------------------------------------------------//

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  if (urlDatabase[shortURL]) {
    res.redirect(`${urlDatabase[shortURL].longURL}`);
  } else {
    res.status(404).send("404 page not found");
  }
});

app.get("/urls/new", (req, res) => {
  const isLoggedin = req.cookies["user_id"];
  if (!isLoggedin) {
    res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  const isLoggedin = req.cookies["user_id"];
  if (!isLoggedin) {
    res.status(401).send("Error: You must be logged in to shorten a URL");
  }

  const key = generateRandomString();

  urlDatabase[key] = {}; //initilize new object within url database

  urlDatabase[key].longURL = req.body.longURL;
  urlDatabase[key].userID = isLoggedin;

  res.redirect(`/urls/${key}`);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];

  if (!userID) {
    res.redirect("/login");
  }

  const UserURLs = getUserURLs(userID);

  const templateVars = {
    urls: UserURLs,
    user: users[userID],
  };

  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;

  urlDatabase[shortURL].longURL = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const userID = req.cookies["user_id"];

  if (!urlDatabase[shortURL]) {
    //if they requested a non existant short url redirect to urls
    res.redirect("/urls");
  }

  if (urlDatabase[shortURL].userID !== userID) {
    //guards against accessing someone elses' :shortURL will redirect back to "/urls"
    res.redirect("/urls");
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userID],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //to edit
  //need to make sure that the user is logged in to do this
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//-------------------------------------------------------------------//

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID) {
    //user already logged in
    res.redirect("/urls");
  }
  const templateVars = {
    user: null, //have to send a user object every header render
  };
  res.render("new_user", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const userID = findUserIDbyEmail(email); //returns false if not found
  if (!(password && email && !userID)) {
    //checks to see if the email, and password fields are complete and the email is not in use
    return res.status(400).send("Bad Request");
  }

  const newUser = {
    id: generateRandomString(),
    email: email,
    password: password,
  };

  users[newUser.id] = newUser;

  res.cookie("user_id", newUser.id);

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID) {
    //user already logged in
    res.redirect("/urls");
  }
  const templateVars = {
    user: null, //have to send to a user object to render a header
  };
  res.render("login_user", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userID = findUserIDbyEmail(email);

  if (!userID) {
    return res.status(403).send("error: username or password incorrect");
  }

  if (!checkUserPassword(password, email)) {
    return res.status(403).send("error: username or password incorrect");
  }

  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => uuidv4().slice(0, 6);

//console.log(generateRandomString());
