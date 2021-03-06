/**
 * Module dependencies
 */

var client = require('../boot/redis');


/**
 * Check session
 */

function checkSession(req, res) {
  var initialOpbs = req.session.opbs;
  client.get('sess:' + req.sessionID, function (err, data) {
    try {
      var opbs = JSON.parse(data).opbs;
      if (opbs !== initialOpbs) {
        res.write("event: update\n");
        res.write("data: " + opbs + "\n\n");
      }
    } catch (e) {}

    setTimeout(function () {
      checkSession(req, res);
    }, 3000);
  })
};


/**
 * Export
 */

module.exports = checkSession;

