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

      var find = sails.models.user.findOne({username: params.username, password: params.password}).populate('websites');

      find.exec(function (error, user) {
        if (error) {
          return res.negotiate(error);
        }

        if (!user) {
          return res.badRequest('invalid_credentials');
        }

        var authResponse = {},
          tokenData = {};

        if (user.websites.length === 1) {
          authResponse.website = tokenData.website = user.websites[0].id;
        } else {
          authResponse.websites = tokenData.websites = user.websites;
        }

        tokenData.user     = user.id;
        authResponse.token = jwtService.issueToken(tokenData);

        res.ok(authResponse);
      });
    });
  },

  getIdentity : function(req, res) {
    res.ok({identity: req.token.user});
  }
};

