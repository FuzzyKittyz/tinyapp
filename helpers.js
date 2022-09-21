function checkValue(string, key, users) {
  for (let user in users) {
    let value = users[user];
    if (string === value[key]){
      return users[user]
    };
  };
  return null
};

module.exports = checkValue;