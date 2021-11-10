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

const users = {
  "9eca5f": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "1eavdf": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

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
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]], //do we need?
  };
  res.render("new_user", templateVars);
});

app.post("/register", (req, res) => {
  //   This endpoint should add a new user object to the global users object. The user object should include the user's id, email and password, similar to the example above. To generate a random user ID, use the same function you use to generate random IDs for URLs.
  // After adding the user, set a user_id cookie containing the user's newly generated ID.
  // Redirect the user to the /urls page.
  // Test that the users object is properly being appended to. You can insert a console.log or debugger prior to the redirect logic to inspect what data the object contains.
  // Also test that the user_id cookie is being set correctly upon redirection. You already did this sort of testing in the Cookies in Express activity. Use the same approach here.
  console.log(req.body.password);
  const newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password,
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
