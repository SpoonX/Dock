module.exports = function badRequest(name, details) {

  // Get access to `res`
  var res = this.res;

  // Set status code
  res.status(400);

  if (!name) {
    return res.jsonp({status: 400});
  }

  // Log error to console
  this.req._sails.log.verbose('Sent 400 ("Bad Request") response');
  this.req._sails.log.verbose(name);

  res.jsonp(createResponse(name, details));
};

/**
 * A helper method, making it easier to set badRequest responses.
 *
 * @param {string} error
 * @param details
 * @returns {{error: *, message: *, info: *}}
 */
function createResponse(error, details) {
  var response;

  if ('object' === typeof error) {
    return error;
  }

  response = {
    status: 400,
    error: error
  };

  switch (error) {
    // Uniform response for missing parameters.
    case 'missing_parameter':
      response.summary = 'Required parameter ' + (details ? ('"'+details+'" ') : '') + 'not supplied.';
      response.parameter = details;
      break;

    // Uniform response for missing roles.
    case 'missing_role':
      response.summary = 'User exists, but does not have supplied role.';
      response.role = details;
      break;

    // Uniform response for invalid parameters.
    case 'invalid_parameter':
      response.summary = 'Invalid value for parameter' + (details ? ' "'+details+'".' : '.');
      response.parameter = details;
      break;

    // By default we just return what we got.
    default:
      response.summary = details;
  }

  return response;
}
