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
  __construct : function (sailsApp) {
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

    var website       = req.token.website,
        uploadedFiles = [];

    // Upload the file, skipper!
    req.file('media').upload(function (error, files) {
      var file, tmpFile;

      // Make sure upload succeeded.
      if (error) {
        return res.negotiate(error);
      }

      // Pop through all uploaded files.
      (function next() {
        file    = files.pop();
        tmpFile = file.fd;

        // Make sure the file isn't too big.
        if (file.size > config.maxFileSize) {
          return fs.unlink(tmpFile, function () {
            res.badRequest(
              'file_too_large', 'The supplied file is too large. Limit set to ' + config.maxFileSize + ' bytes.'
            );
          });
        }

        // Make sure the file is not a duplicate.
        mediaModel.find({filename: file.filename, website : website}, function (error, result) {

          // Somehow the query failed.
          if (error) {
            return res.negotiate(error);
          }

          // The result isn't empty. Duplicate file!
          if (result.length > 0) {
            return res.badRequest('duplicate_file', 'A file by the name "' + file.filename + '" already exists.');
          }

          websiteModel.findOne(website, function (error, website) {
            if (error) {
              return res.negotiate(error);
            }

            ftpService.getConnection(website, function (error, connection) {
              if (error) {
                return res.negotiate(error);
              }

              var mediaDirectory = website.media_directory ? website.media_directory : 'media';

              connection.put(tmpFile, path.join(website.root_directory, mediaDirectory, file.filename), function (error) {
                if (error) {
                  return res.negotiate(error);
                }

                mediaModel.create({
                  filename : file.filename,
                  size     : file.size,
                  mime_type: file.type,
                  website  : website.id
                }, function (error, model) {
                  if (error) {
                    return res.negotiate(error);
                  }

                  return fs.unlink(tmpFile, function (error) {
                    if (error) {
                      return res.negotiate(error);
                    }

                    uploadedFiles.push(model);

                    // Still some files left. Let's continue working on those.
                    if (files.length > 0) {
                      return next();
                    }

                    // All done. Notify the user about the cool shit we've done.
                    res.ok(uploadedFiles);
                  });
                });
              });
            });
          });
        });
      })();
    });
  }
};
