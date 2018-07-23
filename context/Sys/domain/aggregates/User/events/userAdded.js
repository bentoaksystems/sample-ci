module.exports = (user, payload) => {
  return Promise.resolve(user.get({plain: true}));
}