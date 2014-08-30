module.exports = function sendOK(data) {

  // Get access to `res`
  var res = this.res;

  // Set status code
  res.status(200);

  // Log error to console
  this.req._sails.log.verbose('Sent 200 ("OK") response');

  if (typeof data === 'undefined') {
    // Things that don't have data, like "logout". Client side will look for res.error anyway.
    return res.jsonp({status: 200});
  }

  this.req._sails.log.verbose(data);

  if (typeof data !== 'object') {
    throw new Error('Expected a valid data type (object) as response data.');
  }

  res.jsonp(data);
};
