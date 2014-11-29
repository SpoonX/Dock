/**
 * WebsiteController
 *
 * @description :: Server-side logic for managing websites
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  publish : function (req, res) {
    pageService.save(req.token.website, req.param('page'), req.param('body'), function (error, revision) {
      if (error) {
        return res.negotiate(error);
      }

      return res.ok({
        revision: revision
      });
    });
  }
};
