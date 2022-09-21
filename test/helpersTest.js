const { assert } = require('chai');

const checkValue  = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkValue("user@example.com", 'email',testUsers)
    const expectedUserID =  {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedUserID)  
 });
  it('should return null if a user is not found', function() {
    const user = checkValue("user@example.ca", 'email',testUsers)
  
    const expectedUserID = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, null)  
  })
});