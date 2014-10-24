module.exports = {
  schema    : true,
  attributes: {
    filename : {
      type  : 'string',
      unique: true,
      index : true
    },
    website  : {
      model: 'website'
    },
    size     : 'integer',
    mime_type: 'string'
  }
};
