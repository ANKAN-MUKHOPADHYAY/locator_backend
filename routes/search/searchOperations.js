var express = require('express');
var mysql = require('mysql');
var connection = require('../dbconnection');
var router = express.Router();

/* GET home page. */
router.get('/allcourses', function(req, res, next) {
  	var searchQry = 'SELECT * from OFFERED_COURSES';
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "Course Not registered yet. Kindly send the course details to admin@locateit.com"});
		}
	});
});

router.get('/alllocation', function(req, res, next) {
	var searchQry = 'SELECT * from offered_locations';
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "We have not started our business in this location. We are working on the same."});
		}
	});
});

router.get('/alllocation/:city', function(req, res, next) {
	var searchQry = 'SELECT * from offered_locations where ??=?';
	var searchData = ['LOC_LOCATION_CITY',req.params.city]; 
	searchQry = mysql.format(searchQry,searchData); 
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "We have not started our business in this location. We are working on the same."});
		}
	});
});

router.get('/searchcourses/:course', function(req,res){
	console.log(req.params.course);
	var x =  '%'+req.params.course+'%';
	var searchQry = 'SELECT * from OFFERED_COURSES where ?? like ?';
	var searchQryData = ['LOC_COURSE_NAME',x];
	searchQry = mysql.format(searchQry,searchQryData);
	console.log(searchQry);
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "Course Not Found"});
		}
	});
});

router.get('/searchlocations/:location', function(req,res){
	//console.log(req.params.course);
	var x =  '%'+req.params.location+'%';
	var searchQry = 'SELECT * from OFFERED_LOCATIONS where ?? like ? or ??=? or ?? like ? ';
	var searchQryData = ['LOC_LOCATION_NAME',x, 'LOC_LOCATION_PINCODE',req.params.location, 'LOC_LOCATION_RELEVANCE_NAME',x];
	searchQry = mysql.format(searchQry,searchQryData);
	console.log(searchQry);
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "Location Not Found"});
		}
	});
});

module.exports = router;
