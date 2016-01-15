var express = require('express');
var router = express.Router();

router.get('/user/12', function(req, res, next) {
  res.send({
    data: {
      id: 12,
      type: 'user',
      attributes: {
        name: 'foo'
      },
      relationships: {
        'pantry': {
          data: {
            id: 42,
            type: 'pantry'
          },
          links: {
            related: '/api/pantry/42'
          }
        }
      }
    }
  });
});

router.get('/pantry/42', function(req, res, next) {
  res.send({
    data: {
      id: 42,
      attributes: {
        name: 'bar'
      },
      relationships: {
        'user': {
          data: {
            id: 12,
            type: 'user'
          }
        }
      }
    }
  });
});

router.get('/shipment', function(req, res, next) {
  res.send([{
    data: {
      id: 1,
      type: 'shipment',
      attributes: {
        name: 'shipment1'
      },
      relationships: {
        'pantry': {
          id: 52,
          type: 'pantry'
        }
      }
    }
  }, {
    data: {
      id: 2,
      type: 'shipment',
      attributes: {
        name: 'shipment2'
      },
      relationships: {
        'pantry': {
          id: 52,
          type: 'pantry'
        }
      }
    }
  }, {
    data: {
      id: 3,
      type: 'shipment',
      attributes: {
        name: 'shipment3'
      },
      relationships: {
        'pantry': {
          id: 52,
          type: 'pantry'
        }
      }
    }
  }]);
});

module.exports = router;
