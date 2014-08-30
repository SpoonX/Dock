/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var helpers = require('request-helpers');

module.exports = {
  authenticate : function (req, res) {
    helpers.pickParams(['username', 'password'], req, function(missing, params) {

      if (missing) {
        return res.badRequest('missing_param', missing);
      }

      sails.models.user.findOne({username: params.username, password: params.password}, function (error, user) {
        if (error) {
          return res.negotiate(error);
        }

        if (!user) {
          return res.badRequest('invalid_credentials');
        }

        res.ok({
          token: sails.services.jwtservice.issueToken({user: user.id})
        });
      });
    });
  },

  getIdentity : function(req, res) {
    res.ok({identity: req.token.user});
  }
};

