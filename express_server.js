const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid"); //used to generate random string for generateRandomString()

const PORT = 8080;

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:shortURL", (req, res) => {
  //console.log(urlDatabase[req.params.shortURL]);
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(`${urlDatabase[req.params.shortURL]}`);
  } else {
    res.status(404).send("404 page not found");
  }
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  const key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  //console.log(urlDatabase);

  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${key}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => uuidv4().slice(0, 6);

console.log(generateRandomString());
