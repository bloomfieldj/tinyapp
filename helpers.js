const CryptoJS = require('crypto-js')
const aes = CryptoJS.AES

const getUserByEmail = function(email, database) {
  for(user in database) {
    if(database[user].email === email) {
      return user;
    }
  }
}

const urlsForUser = function(id, url, database) {
  if (url in database && id === database[url].userID) {
    return true;
  }
};

const generateRandomString = function () {
  return new Array(6).join().replace(/(.|$)/g, function() {return ((Math.random()*36)|0).toString(36)[Math.random()<.5?"toString":"toUpperCase"]();});
}

const generateRandomID = function () {
  return new Array(8).join().replace(/(.|$)/g, function() {return ((Math.random()*36)|0).toString(36)[Math.random()<.5?"toString":"toUpperCase"]();});
}

const encryptID = function(userID) {
  const encryptedID = aes.encrypt(userID,"123").toString();
  return encryptedID;
}

const decryptID = function(encryptedID) {
  if(encryptedID) {
    const bytesOfID = aes.decrypt(encryptedID, "123")
    const decryptedID = bytesOfID.toString(CryptoJS.enc.Utf8);
    return decryptedID;
  }
}


module.exports = {      
  getUserByEmail,  
  urlsForUser,
  generateRandomID,
  generateRandomString,
  encryptID,
  decryptID
}