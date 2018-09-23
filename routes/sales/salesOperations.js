var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = require('../dbconnection');

router.get('/salesops/:searchparam', function(req,res){
	var searchQry = "SELECT GROUP_CONCAT(LOC_LOCATION_ID) as ops FROM offered_locations WHERE ??=? OR ??=?";
	var searchData = ['LOC_LOCATION_PINCODE',req.params.searchparam,'LOC_LOCATION_CITY',req.params.searchparam];
	searchQry = mysql.format(searchQry,searchData);
	sqlGetCall(searchQry, function(data){
		console.log(data[0].ops);
		var queryLC,queryLCData;
		queryLC= 'SELECT * FROM user_enquiry WHERE ?? IN (?)';
		queryLCData = ['LOC_SELECTED_LOCATION', data[0].ops];
		queryLC = mysql.format(queryLC,queryLCData);
		console.log(queryLC);

		sqlGetCall(queryLC, function(listed){
			console.log(listed);
		});
	});
});



function sqlGetCall(query,callback){
	if(query){
		connection.query(query, function(err,res){
			setTimeout(function() {
				if(err){
					callback(err);
				}
				callback(res);
			}, 100);
		});	
	}
}

module.exports = router;