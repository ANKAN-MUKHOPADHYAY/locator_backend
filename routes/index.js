var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Warm welcome from TechNinzaz' });
  res.json({status:true, message: 'Hey Welcome'})
});

router.get('/getuserinfo', function(req,res){
	res.json({status:true, message: 'Success Response', result: {fname:'Jagan',lname:'Mohan'}})
});

module.exports = router;
