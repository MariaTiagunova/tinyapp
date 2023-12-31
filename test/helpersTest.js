const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  "q63YKZ": {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9B1XKr": {
    longUrl: "http://www.google.ca",
    userID: "userRandomID"
  },
  "zB4A4g": {
    longUrl: "https://www.digitalocean.com/",
    userID: "user2RandomID"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user, testUsers[expectedUserID]);
  });
  it('should return undefined for a non-existent email', function() {
    const user = getUserByEmail("user10@example.com", testUsers);
    assert.strictEqual(user, undefined);
  });
});

describe('generateRandomString', function() {
  it('should return a string of a passed-in number of characters', function() {
    const randomStringLength = generateRandomString(10).length;
    const expectedOutput = 10;
    assert.equal(randomStringLength, expectedOutput);
  });

  it('should return different strings when called multiple times', function() {
    const firstRandomString = generateRandomString(6);
    const secondRandomString = generateRandomString(6);
    assert.notEqual(firstRandomString, secondRandomString);
  });
});

describe('urlsForUser', function() {
  it('should return only the URLs which the logged-in user owns', function() {
    const usersUrls = urlsForUser("userRandomID", testUrlDatabase);
    const expectedOutput = { "q63YKZ": {
      longUrl: "http://www.lighthouselabs.ca",
      userID: "userRandomID"
    },
    "9B1XKr": {
      longUrl: "http://www.google.ca",
      userID: "userRandomID"
    }
    };
    assert.deepEqual(usersUrls, expectedOutput);
  })
})