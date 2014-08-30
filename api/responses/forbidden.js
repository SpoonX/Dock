module.exports = function forbidden(err, info) {

  // Get access to `res`
  var res = this.res;

  // Set status code
  res.status(403);

  // Log error to console
  this.req._sails.log.verbose('Sent 403 ("Forbidden") response');
  if (err) {
    this.req._sails.log.verbose(err);
  }

  if (!err) {
    return res.jsonp({status: 403});
  }

  if (typeof err !== 'object' || err instanceof Error) {
    err = {error: err};
  }

  if (info) {
    err.summary = info;
  }

  err.status = 403;

  res.jsonp(err);
};
