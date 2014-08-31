module.exports = {
  attributes: {
    username: 'string',
    password: 'string',
    role    : {
      type      : 'string',
      defaultsTo: 'editor'
    },
    websites: {
      collection: 'website',
      via       : 'users',
      dominant  : true
    }
  }
};
