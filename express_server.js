const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const PORT = 8080;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

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

const users = {
  123456: { id: "123456", email: "thief@thief.com", password: "123456" },
}; // test code

const helperClosure = require("./helpers");
const {
  findUserIDbyEmail,
  checkUserPassword,
  getUserURLs,
  generateRandomString,
} = helperClosure(urlDatabase, users);

//-------------------------------------------------------------------
//  / route
//-------------------------------------------------------------------

app.get("/", (req, res) => {
  res.redirect("/urls");
});

//-------------------------------------------------------------------
//  /u/:shortURL route
//-------------------------------------------------------------------

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  if (urlDatabase[shortURL]) {
    return res.redirect(`${urlDatabase[shortURL].longURL}`);
  }
  res.status(404).send("404 page not found");
});

//-------------------------------------------------------------------
//  /urls/new routes
//-------------------------------------------------------------------

//if server restarts it still accepts requests

app.get("/urls/new", (req, res) => {
  const cookieUserID = req.cookies["user_id"]; //isnt secure
  if (!cookieUserID || !users[cookieUserID]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[cookieUserID] };
  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  const cookieUserID = req.cookies["user_id"];
  if (!cookieUserID || !users[cookieUserID]) {
    return res
      .status(401)
      .send("Error: You must be logged in to shorten a URL");
  }

  const longURL = req.body.longURL;
  // const userID = req.cookies["user_id"];

  const newURL = { longURL, userID: cookieUserID };

  const key = generateRandomString();
  urlDatabase[key] = newURL; //initilize new object within url database

  // urlDatabase[key].longURL = req.body.longURL; //maybe i can assign this above instead of an empty object
  // urlDatabase[key].userID = isLoggedin;

  res.redirect(`/urls/${key}`);
});

//-------------------------------------------------------------------
//  /urls route
//-------------------------------------------------------------------

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]; //not secure

  if (!userID || !users[userID]) {
    //you dont have permission to view the urls
    return res.redirect("/login");
  }

  const userURLs = getUserURLs(userID);

  const templateVars = {
    urls: userURLs,
    user: users[userID],
  };

  res.render("urls_index", templateVars);
});

//-------------------------------------------------------------------
//  /urls/:shortURL routes
//-------------------------------------------------------------------

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const cookieUserID = req.cookies["user_id"];

  if (!cookieUserID) {
    //if you have no cookie, redirect to log in
    return res.redirect("/login");
  }

  if (!urlDatabase[shortURL]) {
    //if they requested a non existant short url redirect to urls
    return res.redirect("/urls");
  }

  const databaseUserID = urlDatabase[shortURL].userID;

  console.log(urlDatabase);

  if (databaseUserID !== cookieUserID) {
    //guards against accessing someone elses' :shortURL will redirect back to "/urls"
    return res
      .status(403)
      .send("Error: you cannot access others short URLs to edit");
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[cookieUserID],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const cookieUserID = req.cookies["user_id"];
  if (!urlDatabase[shortURL]) {
    return res.status(403).send("You do not have permission to modify this!");
  }
  const databaseUserID = urlDatabase[shortURL].userID;

  if (databaseUserID !== cookieUserID) {
    //if the database userid differs from the cookie user id
    //makes sure things can only be modified by the owner
    return res.status(403).send("You do not have permission to modify this!");
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  const cookieUserID = req.cookies["user_id"];
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("This Record doesn't exist, cannot Delete");
  }
  const databaseUserID = urlDatabase[shortURL].userID;

  if (databaseUserID !== cookieUserID) {
    //makes sure things can only be deleted by the owner
    return res.status(403).send("You do not have permission to delete this!");
  }

  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

//-------------------------------------------------------------------//

//-------------------------------------------------------------------//
// Registration  Routes
//-------------------------------------------------------------------//

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  if (users[userID]) {
    //user already logged in
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null, //have to send a user object every header render
  };
  res.render("new_user", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const userID = findUserIDbyEmail(email); //returns false if not found, returns the user ID if found
  if (!(password && email && !userID)) {
    //checks to see if the email, and password fields are complete, and the email is not in use
    return res.status(400).send("Bad Request");
  }

  const hashedPassword = bcrypt.hashSync(password, 10); //hashes the password synchronously

  const newUser = {
    id: generateRandomString(),
    email,
    password: hashedPassword,
  };

  users[newUser.id] = newUser; //add the new user to the existing users database

  console.log(users);

  res.cookie("user_id", newUser.id);

  res.redirect("/urls");
});

//-------------------------------------------------------------------//
// Login/Logout  Routes
//-------------------------------------------------------------------//

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  if (users[userID]) {
    //user already logged in
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null, //have to send to a user object to render a header
  };
  res.render("login_user", templateVars);
});

app.post("/login", (req, res) => {
  // bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
  // bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false
  const { email, password } = req.body;
  const userID = findUserIDbyEmail(email);

  if (!userID) {
    return res.status(403).send("error: username or password incorrect");
  }

  if (!checkUserPassword(password, email)) {
    return res.status(403).send("error: username or password incorrect");
  }

  //set the cookie on login success

  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//-------------------------------------------------------------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//how bout lets not dump the entire database

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
