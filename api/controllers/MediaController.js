/**
 * MediaController
 *
 * @description :: Server-side logic for managing media
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = {
  upload: function (req, res) {
    sails.services.mediaservice.upload(req, res);
  }
};
