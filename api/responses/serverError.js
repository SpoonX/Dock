module.exports = function serverError(data, details) {

  sails.log.error('Full error arguments: ', data, details);
  // Get access to `res`
  var res = this.res;

  // Set status code
  res.status(500);

  // Log error to console
  sails.log.error('Sent 500 ("Server Error") response');

  if (details) {
    sails.log.error(details); // Log the error details.
  }

  if (!data) {
    return res.jsonp({status: 500});
  }
  if (typeof data !== 'object' || data instanceof Error) {
    data = {error: data};
  }

  data.status = 500;

  res.jsonp(data);
};
