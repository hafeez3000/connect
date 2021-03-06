/**
 * Module dependencies
 */

var oidc     = require('../oidc')
  , settings = require('../boot/settings')
  , passport = require('passport')
  , crypto   = require('crypto')
  , qs       = require('qs')
  ;


/**
 * Signin Endpoint
 */

module.exports = function (server) {

  /**
   * Signin page
   */

  server.get('/signin',
    oidc.selectConnectParams,
    oidc.validateAuthorizationParams,
    oidc.verifyClient,
    function (req, res, next) {
      res.render('signin', {
        params:    qs.stringify(req.query),
        request:   req.query,
        providers: settings.providers
      });
    });


  /**
   * Password signin handler
   */

  var handler = [
    oidc.selectConnectParams,
    oidc.validateAuthorizationParams,
    oidc.verifyClient,
    function (req, res, next) {
      passport.authenticate('local', function (err, user, info) {
        if (!user) {
          res.render('signin', {
            params:    qs.stringify(req.body),
            request:   req.body,
            providers: settings.providers,
            error:     info.message
          });
        } else {
          req.login(user, function (err) {
            req.session.opbs = crypto.randomBytes(256).toString('hex');
            next(err);
          });
        }
      })(req, res, next);
    },
    oidc.determineUserScope,
    oidc.promptToAuthorize,
    oidc.authorize
  ];

  if (oidc.beforeAuthorize) {
    handler.splice(handler.length - 1, 0, oidc.beforeAuthorize)
  }

  server.post('/signin', handler);

};

