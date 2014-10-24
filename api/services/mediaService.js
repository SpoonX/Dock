var path = require('path'),
    fs   = require('fs'),
    sails,
    mediaModel,
    websiteModel,
    config;

module.exports = self = {

  /**
   * @param sailsApp
   */
  __construct: function (sailsApp) {
    sails        = sailsApp;
    config       = sails.config.media;
    mediaModel   = sails.models.media;
    websiteModel = sails.models.website;
  },

  /**
   * Upload files sent with req object.
   *
   * @param req
   * @param res
   */
  upload: function (req, res) {

    var website = req.token.website,
        uploadedFiles = [],
        websiteInstance,
        file,
        tmpFile;

    async.waterfall([
      function (callback) {
        websiteModel.findOne(website).exec(callback);
      },

      function (result, callback) {
        websiteInstance = result;

        callback(null);
      },

      function (callback) {
        req.file('media').upload(callback);
      },

      function (files, done) {
        (function next () {
          file = files.pop();
          tmpFile = file.fd;

          // Make sure the file isn't too big.
          if (file.size > config.maxFileSize) {
            return fs.unlink(tmpFile, function () {
              done('file_too_large');
            });
          }

          async.waterfall([
            function (callback) {
              mediaModel.find({filename: file.filename, website: website}).exec(callback);
            },

            function (result, callback) {
              if (result.length > 0) {
                return callback('duplicate_file');
              }

              callback(null, websiteInstance);
            },

            ftpService.getConnection,

            function (connection, callback) {
              connection.put(
                tmpFile,
                path.join(
                  websiteInstance.root_directory,
                  websiteInstance.media_directory,
                  file.filename
                ),
                callback
              );
            },

            function (callback) {
              mediaModel.create({
                filename : file.filename,
                size     : file.size,
                mime_type: file.type,
                website  : websiteInstance.id
              }, callback);
            },

            function (model, callback) {
              uploadedFiles.push(model);

              fs.unlink(tmpFile, callback);
            }
          ], function (error) {
            if (error) {
              return res.negotiate(error);
            }

            // Still some files left. Let's continue working on those.
            if (files.length > 0) {
              return next();
            }

            // All done. Notify the user about the cool shit we've done.
            done();
          });
        })();
      }
    ], function (error) {
      if (error) {
        return res.negotiate(error);
      }

      res.ok({files: uploadedFiles});
    });
  }
};
