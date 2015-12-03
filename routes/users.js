var express = require('express');
var router = express.Router();

router.get('/user', function(req, res, next) {
  res.send({
    id: 12,
    name: 'foo',
    pantryId: 42
  });
});

router.get('/pantry', function(req, res, next) {
  res.send({
    id: 42,
    userId: 12,
    name: 'bar'
  });
});

module.exports = router;
