var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'techninzaz_locator'
});

connection.connect();

/* GET home page. */
router.get('/allcourses', function(req, res, next) {
  	var searchQry = 'SELECT * from offered_courses';
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "Coure Not Found"});
		}
	});
});

router.get('/alllocation', function(req, res, next) {
  	var searchQry = 'SELECT * from offered_locations';
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "Coure Not Found"});
		}
	});
});

router.get('/searchcourses/:course', function(req,res){
	console.log(req.params.course);
	var x =  '%'+req.params.course+'%';
	var searchQry = 'SELECT * from offered_courses where ?? like ?';
	var searchQryData = ['course_name',x];
	searchQry = mysql.format(searchQry,searchQryData);
	console.log(searchQry);
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "Coure Not Found"});
		}
	});
});

router.get('/searchlocations/:location', function(req,res){
	//console.log(req.params.course);
	var x =  '%'+req.params.location+'%';
	var searchQry = 'SELECT * from offered_locations where ?? like ? or ??=? or ?? like ? ';
	var searchQryData = ['location_name',x, 'location_pincode',req.params.location, 'location_nearby',x];
	searchQry = mysql.format(searchQry,searchQryData);
	//console.log(searchQry);
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "Location Not Found"});
		}
	});
});

module.exports = router;
