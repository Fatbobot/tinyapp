
const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');
// constants
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
// test case
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID)
  });
  it('should return undefined if email is not valid', function() {
    const user = getUserByEmail("undefined@hotmail.com", testUsers)
    assert.strictEqual(user, undefined)
  });
});