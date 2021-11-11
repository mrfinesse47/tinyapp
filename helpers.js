const helperClosure = (urlDatabase, users) => {
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
    //similar to the requested urlsForUser function
    const userDB = {};
    for (key in urlDatabase) {
      if (urlDatabase[key].userID === userID) {
        userDB[key] = urlDatabase[key].longURL;
      }
    }
    return userDB;
  };

  return { findUserIDbyEmail, checkUserPassword, getUserURLs };
};

module.exports = helperClosure;
