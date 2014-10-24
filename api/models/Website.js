module.exports = {
  schema    : true,
  attributes: {
    host           : 'string',
    user           : 'string',
    password       : 'string',
    port           : {
      type      : 'integer',
      defaultsTo: 21
    },
    root_directory : {
      type      : 'string',
      defaultsTo: '/'
    },
    media_directory: {
      type      : 'string',
      defaultsTo: 'media'
    },
    users          : {
      collection: 'user',
      via       : 'websites'
    },
    toJSON         : function () {
      var object = this.toObject();

      return {
        host: object.host
      };
    }
  }
};
