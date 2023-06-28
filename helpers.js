const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email)
      return database[user];
  }
};

// Generates random string with 6 symbols for short URL id and User id
const generateRandomString = function(length) {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};

// Returns only logged in user's URLs
const urlsForUser = function(id, database) {
  let userURLs = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = database[shortURL];
    }
  }
  return userURLs;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };