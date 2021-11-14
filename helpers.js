const { v4: uuidv4 } = require("uuid"); //used to generate random string for generateRandomString()

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
    //gets all the urls per userID and other information related to the URLs like unique visits
    const userDB = {};
    for (const key in urlDatabase) {
      if (urlDatabase[key].userID === userID) {
        userDB[key] = {
          longURL: urlDatabase[key].longURL,
          totalVisits: urlDatabase[key].totalVisits,
          uniqueVisits: urlDatabase[key].uniqueVisits,
          visitedBy: urlDatabase[key].visitedBy,
        };
      }
    }
    return userDB; //returns an URL database unique to the users ID
  };

  const isUniqueVisitor = (visitorID, shortURL) => {
    const visitorList = urlDatabase[shortURL].visitedBy;

    for (let i = 0; i < visitorList.length; i++) {
      if (visitorList[i].visitorID === visitorID) {
        return false;
      }
    }
    return true;
  };

  const generateRandomString = () => uuidv4().slice(0, 6);

  return {
    findUserIDbyEmail,
    getUserURLs,
    generateRandomString,
    isUniqueVisitor,
  };
};

module.exports = helperClosure;
