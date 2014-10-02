var trumpet = require('trumpet'),
    Client  = require('ftp');

function createContentManipulationStreams (trumpetStream, content) {
  var k;

  for (k in content) {
    trumpetStream.select('.sx-content-area[data-sx-area="' + k + '"]').createWriteStream().end(content[k]);
  }
}

module.exports = {
  save: function (website, page, content, done) {
    var trumpetStream = trumpet(),
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
        connection.get(filename, callback);
      },

      // Manipulate the data coming in through trumpet, and pipe it back to the server through `.put()`.
      function (fileStream, callback) {
        var manipulated = '';

        // Workaround to keep `trumpet` from automatically resume()'ing
        //trumpetStream._piping = true;

        trumpetStream.on('data', function (buffer) {
          manipulated += buffer.toString();
        });

        // Once done, resume.
        trumpetStream.on('end', function () {
          callback(null, manipulated);
        });

        // Manipulate the content based on what we got.
        createContentManipulationStreams(trumpetStream, content);

        // Pipe remote file through trumpet for manipulations.
        fileStream.pipe(trumpetStream);
      },

      // Now stream the entirety to `connection.put()`
      function (manipulated, callback) {
        // Pipe manipulated stream back to `filename + '.new'`
        connection.put(manipulated, filename + '.new', callback);
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
