const { v4: uuidv4 } = require("uuid"); //used to generate random string for generateRandomString()
const bcrypt = require("bcryptjs");

const helperClosure = (urlDatabase, users) => {
  const findUserIDbyEmail = (email) => {
    for (const id in users) {
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
    if (bcrypt.compareSync(password, users[id].password)) {
      return id;
    }
    return false;
  };

  const getUserURLs = (userID) => {
    //similar to the requested urlsForUser function
    const userDB = {};
    for (const key in urlDatabase) {
      if (urlDatabase[key].userID === userID) {
        userDB[key] = urlDatabase[key].longURL;
      }
    }
    return userDB;
  };

  const generateRandomString = () => uuidv4().slice(0, 6);

  return {
    findUserIDbyEmail,
    checkUserPassword,
    getUserURLs,
    generateRandomString,
  };
};

module.exports = helperClosure;
