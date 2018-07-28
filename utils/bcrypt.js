const env = require('../env');

SALT_WORK_FACTOR = 10;

genSalt = (rawPassword) => new Promise((resolve, reject) => {
  // generate a salt
  env.bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) reject(err);

    // hash the password using our new salt
    env.bcrypt.hash(rawPassword, salt, null, function (err, hash) {
      if (err) reject(err);
      resolve(hash);
    });
  });
})

comparePassword = (hashPassword, rowPassword) => new Promise((resolve, reject) => {
  env.bcrypt.compare(rowPassword, hashPassword, function (err, isMatch) {
    if (err) reject(err);
    resolve(isMatch);
  });
});

module.exports = {
  genSalt,
  comparePassword
}