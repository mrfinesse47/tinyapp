const helperClosure = require("../helpers");
const { assert } = require("chai");

//test driver objects

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW",
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW",
//   },
// };

const { findUserIDbyEmail } = helperClosure(null, testUsers);

describe("findUserIDbyEmail", function() {
  it("should return a user ID when passed in a valid email", function() {
    const userID = findUserIDbyEmail("user@example.com");
    const expectedUserID = "userRandomID";

    assert.equal(userID, expectedUserID);
  });
  it("should return null when passed in an in-valid email", function() {
    const userID = findUserIDbyEmail("usfsdfaser@example.com");

    assert.isNull(userID);
  });
  it("should return null when passed in an empty string", function() {
    const userID = findUserIDbyEmail("");

    assert.isNull(userID);
  });
  it("should return null when passed in a number", function() {
    const userID = findUserIDbyEmail(23);

    assert.isNull(userID);
  });
});
