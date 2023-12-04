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

const getUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return userId;
    }
  }
  return undefined;
};

const urlsForUser = (id, database)=> {
  const userUrlDatabase = {};
  for (const urlId in database)
    if (id === database[urlId].userID) {
      userUrlDatabase[urlId] = database[urlId]
    }
  return userUrlDatabase;
};

module.exports = {urlsForUser, getUserByEmail, generateString};