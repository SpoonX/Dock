module.exports = function (req, res, next) {
  if (!req.token || !req.token.website) {
    return res.serverError('wrong_token_format');
  }

  req.options.where = {
    website: req.token.website
  };

  next();
};
