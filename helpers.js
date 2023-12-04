//Generates 6 character string for unique IDs
const generateString = function () {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

//Input is desired email, and relevant database. Returns desired email if it is within the database. Returns undefined if not the case
const getUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return userId;
    }
  }
  return undefined;
};

//Input is userId, and relevant database. Returns object of all Urls that current user has created.
const urlsForUser = (id, database) => {
  const userUrlDatabase = {};
  for (const urlId in database)
    if (id === database[urlId].userID) {
      userUrlDatabase[urlId] = database[urlId];
    }
  return userUrlDatabase;
};

module.exports = { urlsForUser, getUserByEmail, generateString };
