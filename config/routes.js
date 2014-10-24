module.exports.routes = {
  'post /user/authenticate': 'UserController.authenticate',
  'get /user/identity'     : 'UserController.getIdentity',
  'put /website/publish'   : 'WebsiteController.publish',
  'post /media/upload'     : 'MediaController.upload'
};
