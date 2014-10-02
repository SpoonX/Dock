var Client      = require('ftp'),
    connections = {};

module.exports = {
  /**
   * @todo apply caching
   * @todo When finding php, check on for .html and give priority to html files
   * @param connection
   * @param pageName
   * @param callback
   */
  resolveFile: function (connection, pageName, callback) {
    pageName = this.normalizePageName(pageName);

    connection.list(function (error, list) {
      if (error) {
        return callback(error);
      }

      var i = 0,
          file;

      for (i; i < list.length; i++) {
        file = list[i];

        if (file.type !== '-') {
          continue;
        }

        if (file.name.indexOf(pageName) !== 0) {
          continue;
        }

        return callback(null, file);
      }

      return callback(null, null);
    });
  },

  lfiStrip: function (fileName, singleDir) {
    if (singleDir) {
      return fileName.replace(/(\.\.|\/)/, '');
    }
    return fileName.replace(/\.\.\/?/, ''); // Replace "../?" with nothing. Allow current dir.
  },

  normalizePageName: function (pageName) {
    pageName = this.lfiStrip(pageName).replace(/\.(html|php)$/, '').replace(/(^(\/|\.)|(\.|\/)$)/, '');

    if (pageName === '') {
      pageName = 'index';
    }

    return pageName;
  },

  getConnection: function (website, callback) {
    function returnConnection (website, callback) {

      website = {
        host    : website.host,
        port    : website.port,
        user    : website.user,
        password: website.password
      };

      if (connections[website.host]) {
        return callback(null, connections[website.host]);
      }

      var client = connections[website.host] = new Client();

      client.on('ready', function () {
        callback(null, client);
      });

      client.on('close', function () {
        connections[website.host] = null; // Force reconnect next time we try to get the connection
      });

      client.on('end', function () {
        connections[website.host] = null; // Force reconnect next time we try to get the connection
      });

      client.connect(website);
    }

    if (typeof website === 'object') {
      return returnConnection(website, callback);
    }

    sails.models.website.findOne(website, function (error, website) {
      if (error) {
        return callback(error);
      }

      if (!website) {
        return callback({error: 'The matrix is deteriorating. We should not be here.'});
      }

      return returnConnection(website, callback);
    });
  },

  put: function (connection, input, fileName, callback) {
    connection.put(input, this.lfiStrip(fileName), callback);
  },

  getStream: function (connection, file, callback) {
    if (!file) {
      return callback({error: 'File not found.'});
    }

    if (typeof file === 'object') {
      file = file.name;
    }

    connection.get(file, function (error, stream) {
      if (error) {
        return callback(error);
      }

      stream.once('close', function () {
        connection.end();
      });

      callback(null, stream);
    });
  },

  saveFile: function (website, page, res) {
    var self = this;

    ftpService.getConnection(website, function (error, connection) {
      self.resolveFile(connection, page, function (filename) {
        res.json({file: filename});
      });
    });
  }
};
