const bcrypt = require("bcrypt");

//HAST FUCNTION
exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        // Store hash in your password DB.
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

//COMPARE || DECRYPT FUNCTION
exports.comparePassword = (password, hashed) => {
  return bcrypt.compare(password, hashed);
};
