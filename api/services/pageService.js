var trumpet = require('trumpet'),
    md5     = require('MD5'),
    path    = require('path'),
    fs      = require('fs');

function createContentManipulationStreams (trumpetStream, content) {
  var k;

  for (k in content) {
    trumpetStream.select('.sx-content-area[data-sx-area="' + k + '"]').createWriteStream().end(content[k]);
  }
}

module.exports = {
  save: function (website, page, content, done) {
    var trumpetStream = trumpet(),
        tmpFileName = path.join(process.cwd(), 'tmp', md5(website.host + (new Date()).getTime().toString() + page)),
        filename,
        connection;

    async.waterfall([

      // Get an ftp connection
      function (callback) {
        ftpService.getConnection(website, callback);
      },

      // Set the ftp connection in a variable to use from here on.
      function (newConnection, callback) {
        connection = newConnection;

        callback(null);
      },

      // Resolve the file based on the page we're on.
      function (callback) {
        ftpService.resolveFile(connection, page, callback);
      },

      // Set the filename so we can use it.
      function (file, callback) {
        filename = file.name;

        callback(null);
      },

      // Get a readStream for the file.
      function (callback) {
        connection.get(filename, function (error, stream) {
          if (error) {
            return callback(error);
          }

          stream.once('close', function() {
            callback(null);
          });

          stream.pipe(fs.createWriteStream(tmpFileName));
        });
      },

      // Manipulate the data coming in through trumpet, and pipe it to a new file
      function (callback) {
        trumpetStream.pipe(fs.createWriteStream(tmpFileName+'.new'));

        trumpetStream.on('end', function () {

          // Done manipulating. Let's go forth.
          callback(null);
        });

        // Manipulate the content based on what we got.
        createContentManipulationStreams(trumpetStream, content);

        // Get the data to manipulate from the file we just fetched,
        fs.createReadStream(tmpFileName).pipe(trumpetStream);
      },

      // Now stream the entirety to `connection.put()`
      function (callback) {
        // Pipe manipulated stream back to `filename + '.new'`
        connection.put(tmpFileName+'.new', filename + '.new', callback);
      },

      // Cleanup
      function (callback) {
        fs.unlink(tmpFileName, callback);
      },

      // Cleanup
      function (callback) {
        fs.unlink(tmpFileName+'.new', callback);
      },

      // Now rename the current file to something else, just to play it safe.
      function (callback) {
        connection.rename(filename, filename + '.bak', callback);
      },

      // And move the new file into place.
      function (result, statusCode, callback) {
        connection.rename(filename + '.new', filename, callback);
      }
    ], function (error) {
      connection.end(); // All done, no need to maintain the connection.

      if (error) {
        return done(error);
      }

      done(null);
    });
  }
};
