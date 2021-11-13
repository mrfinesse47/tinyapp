const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

const PORT = 8080;
const SALT_CYCLES = 10;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(
  cookieSession({
    name: "user_id",
    keys: ["key1", "key2"],
  })
);

app.use(cookieParser());

const urlDatabase = {};
const users = {};

const helperClosure = require("./helpers");
const {
  findUserIDbyEmail,
  getUserURLs,
  generateRandomString,
  isUniqueVisitor,
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

  if (!urlDatabase[shortURL]) {
    res.status(404).send("Error: Page not found");
  }

  let visitorID = req.cookies.visitor_id;

  if (!visitorID) {
    //if the visitor has no cookie set it
    visitorID = generateRandomString();
    res.cookie("visitor_id", visitorID);
  }

  if (isUniqueVisitor(visitorID, shortURL)) {
    urlDatabase[shortURL].uniqueVisits++;
  }

  const timeStamp = new Date().toLocaleString();
  urlDatabase[shortURL].visitedBy.push({ visitorID, timeStamp }); //pushing a cookie ID and timestamp each short url visit
  urlDatabase[shortURL].totalVisits++;

  return res.redirect(`${urlDatabase[shortURL].longURL}`);
});

//-------------------------------------------------------------------
//  /urls/new routes
//-------------------------------------------------------------------

app.get("/urls/new", (req, res) => {
  const cookieUserID = req.session.user_id;
  if (!cookieUserID || !users[cookieUserID]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[cookieUserID] };
  res.render("urls_new", templateVars);
});

//-------------------------------------------------------------------
//  /urls route
//-------------------------------------------------------------------

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (!userID || !users[userID]) {
    //you dont have permission to view the urls
    return res
      .status(400)
      .send(
        'Error: You must be logged in to view long urls. <a href="/login">Login</a>'
      );
  }

  const userURLs = getUserURLs(userID);

  const templateVars = {
    urls: userURLs,
    user: users[userID],
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const cookieUserID = req.session.user_id;
  if (!cookieUserID || !users[cookieUserID]) {
    return res
      .status(401)
      .send(
        'Error: You must be logged in to shorten a URL. <a href="/login">Login</a>'
      );
  }

  const longURL = req.body.longURL;

  const newURL = {
    //about to make a constructor
    longURL,
    userID: cookieUserID,
    totalVisits: 0,
    uniqueVisits: 0,
    visitedBy: [],
  };

  const key = generateRandomString();
  urlDatabase[key] = newURL; //initilize new object within url database

  res.redirect(`/urls/${key}`);
});

//-------------------------------------------------------------------
//  /urls/:shortURL routes get,put,and delete
//-------------------------------------------------------------------

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const cookieUserID = req.session.user_id;

  if (!cookieUserID) {
    //if you have no cookie, redirect to log in
    return res
      .status(400)
      .send(
        'Error: You must be logged in to edit short urls. <a href="/login">Login</a>'
      );
  }

  if (!urlDatabase[shortURL]) {
    //if they requested a non existant short url redirect to urls
    return res.redirect("/urls");
  }

  const databaseUserID = urlDatabase[shortURL].userID;

  if (databaseUserID !== cookieUserID) {
    //guards against accessing someone elses' :shortURL will redirect back to "/urls"
    return res
      .status(403)
      .send(
        'Error: you cannot access others short URLs to edit. Back to <a href="/urls">URLs</a>'
      );
  }

  const userURLs = getUserURLs(databaseUserID);

  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[cookieUserID],
    totalVisits: userURLs[shortURL].totalVisits,
    uniqueVisits: userURLs[shortURL].uniqueVisits,
    visitors: userURLs[shortURL].visitedBy,
  };
  res.render("urls_show", templateVars);
});

app.put("/urls/:shortURL", (req, res) => {
  //used method override module to enable put
  const { shortURL } = req.params;
  const cookieUserID = req.session.user_id;
  if (!urlDatabase[shortURL]) {
    return res.status(403).send("You do not have permission to modify this!");
  }
  const databaseUserID = urlDatabase[shortURL].userID;

  if (databaseUserID !== cookieUserID) {
    //makes sure urls can only be modified by the owner
    return res
      .status(403)
      .send(
        "This is not your link, You do not have permission to modify this!"
      );
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.delete("/urls/:shortURL", (req, res) => {
  //used method override module to enable delete
  const { shortURL } = req.params;
  const cookieUserID = req.session.user_id;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("This Record doesn't exist, cannot Delete");
  }
  const databaseUserID = urlDatabase[shortURL].userID;

  if (databaseUserID !== cookieUserID) {
    //makes sure urls can only be deleted by the owner
    return res
      .status(403)
      .send(
        'You do not have permission to delete this! <a href="/login">Login</a>'
      );
  }

  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

//-------------------------------------------------------------------//

//-------------------------------------------------------------------//
// Registration  Routes
//-------------------------------------------------------------------//

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
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
  const userID = findUserIDbyEmail(email); //returns null if not found, returns the user ID if found
  if (!password || !email || userID) {
    //if there is no password entered, or there is no email entered, or the user id is already taken.
    return res
      .status(400)
      .send('Invalid Credentials. <a href="/register">Register</a>');
  }

  bcrypt.hash(password, SALT_CYCLES, (err, hashedPassword) => {
    //using 10 rounds of salt

    if (err) {
      return res
        .status(500)
        .send('Error: Internal server error. <a href="/register">Register</a>');
    }

    const newUser = {
      id: generateRandomString(),
      email,
      password: hashedPassword,
    };

    users[newUser.id] = newUser; //add the new user to the existing users database

    req.session.user_id = newUser.id;

    res.redirect("/urls");
  });
});

//-------------------------------------------------------------------//
// Login/Logout  Routes
//-------------------------------------------------------------------//

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
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
  const { email, password } = req.body;
  const userID = findUserIDbyEmail(email);

  if (!userID) {
    return res
      .status(403)
      .send(
        'error: username or password incorrect. <a href="/login">Login</a>'
      );
  }

  const userHashedPassword = users[userID].password;

  bcrypt.compare(password, userHashedPassword, (err, result) => {
    if (err) {
      return res
        .status(500)
        .send('Error: Internal server error. <a href="/login">Login</a>');
    }
    if (!result) {
      return res
        .status(403)
        .send(
          'error: username or password incorrect. <a href="/login">Login</a>'
        );
    }
    req.session.user_id = userID;
    return res.redirect("/urls");
  });
});

app.post("/logout", (req, res) => {
  req.session = null; //deletes user cookies
  res.redirect("/login");
});

//-------------------------------------------------------------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
