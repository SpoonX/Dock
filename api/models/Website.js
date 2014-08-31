module.exports = {
  schema    : true,
  attributes: {
    host          : 'string',
    user          : 'string',
    password      : 'string',
    port          : {
      type      : 'integer',
      defaultsTo: 21
    },
    root_directory: {
      type      : 'string',
      defaultsTo: '/'
    },
    users         : {
      collection: 'user',
      via       : 'websites'
    }
  }
};
