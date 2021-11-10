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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {};

//--------------------------------------------------------------------//
//  Helper Functions
//--------------------------------------------------------------------//

const isEmailInUse = (email) => {
  for (id in users) {
    if (users[id].email === email) {
      return true;
    }
  }
  return false;
};

//--------------------------------------------------------------------//

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(`${urlDatabase[req.params.shortURL]}`);
  } else {
    res.status(404).send("404 page not found");
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  const key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.get("/urls", (req, res) => {
  // console.log("user id", req.cookies["user_id"]);
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  // console.log(req.cookies["username"]);
  res.render("urls_index", templateVars);
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body.longURL);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const templateVars = {
    //if using header
    user: users[req.cookies["user_id"]],
  };
  res.render("new_user", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!(password && email && !isEmailInUse(email))) {
    //checks to see if the email, and password fields are complete and the email is not in use
    return res.status(400).send("Bad Request");
  }

  console.log(password);

  const newUser = {
    id: generateRandomString(),
    email: email,
    password: password,
  };

  users[newUser.id] = newUser;

  res.cookie("user_id", newUser.id);

  console.log(users);

  res.redirect("/urls");

  // /res.render("new_user", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => uuidv4().slice(0, 6);

console.log(generateRandomString());
