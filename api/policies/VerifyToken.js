module.exports = function (req, res, next) {
  var token;

  // Yeah we got required 'authorization' header
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');

    if (parts.length !== 2) {
      return res.forbidden('invalid_token', 'Format is Authorization: Bearer [token]');
    }

    var scheme = parts[0],
        credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    }
  } else if (req.param('token')) {
    token = req.param('token');
  } else { // Otherwise request didn't contain required JWT token
    return res.forbidden('invalid_token', 'No Authorization header was found');
  }

  req.body && delete req.body.token;
  req.query && delete req.query.token;

  // Verify JWT token via service
  jwtService.verifyToken(token, function (error, token) {
    if (error) {
      return res.forbidden('invalid_token');
    }

    // Store user id to request object
    req.token = token;

    return next();
  });
};
