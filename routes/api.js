var express = require('express');
var router = express.Router();

router.get('/user/12', function(req, res, next) {
  res.send({
    id: 12,
    name: 'foo',
    pantry: 42
  });
});

router.get('/pantry/42', function(req, res, next) {
  res.send({
    id: 42,
    user: 12,
    name: 'bar'
  });
});

router.get('/shipments', function(req, res, next) {
  res.send([{
    id: 1,
    pantry: 52,
    name: 'shipment1'
  }, {
    id: 2,
    pantry: 52,
    name: 'shipment2'
  }, {
    id: 3,
    pantry: 52,
    name: 'shipment3'
  }]);
});

module.exports = router;
