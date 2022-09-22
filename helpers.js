function checkValue(string, key, users) { //string is what you are getting it to check, key is the key in the obj, users is what database you use it in (users or urldatabase)
  for (let user in users) {
    let value = users[user];
    if (string === value[key]){
      return users[user];//if string is eq return that specific bj
    };
  };
  return null;
};


module.exports = checkValue;