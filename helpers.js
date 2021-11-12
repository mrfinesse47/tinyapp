const { v4: uuidv4 } = require("uuid"); //used to generate random string for generateRandomString()
const bcrypt = require("bcryptjs");

const helperClosure = (urlDatabase, users) => {
  const findUserIDbyEmail = (email) => {
    //it does take in urlDatabase in the form as a closure
    for (const id in users) {
      if (users[id].email === email) {
        return id;
      }
    }
    return null;
  };

  const getUserURLs = (userID) => {
    //similar to the requested urlsForUser function
    const userDB = {};
    for (const key in urlDatabase) {
      if (urlDatabase[key].userID === userID) {
        userDB[key] = urlDatabase[key].longURL;
      }
    }
    return userDB; //returns an object in the form of {shortURL:LongURL,....sortURL:LongURL}
  };

  const generateRandomString = () => uuidv4().slice(0, 6);

  return {
    findUserIDbyEmail,
    getUserURLs,
    generateRandomString,
  };
};

module.exports = helperClosure;
