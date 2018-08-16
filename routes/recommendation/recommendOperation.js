var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = require('../dbconnection');


router.get('/recommended/:enqid/:currentinstid', function(req,res){
	var recommQry = "Select * from USER_ENQUIRY where ??=?";
	var recommData = ['LOC_ENQ_ID',req.params.enqid];
	recommQry = mysql.format(recommQry,recommData);
	//console.log(recommQry);
	sqlGetCall(recommQry, function(data){
		var queryLC,queryLCData;
		queryLC= 'SELECT * from INSTITUTE_REGISTRATION where find_in_set(?,??) <> 0 and find_in_set(?,??) <> 0';
		queryLCData = [data[0].LOC_SELECTED_COURSE,'LOC_INST_OFFER_COURSE',data[0].LOC_SELECTED_LOCATION,'LOC_INST_OFFER_LOCATION'];
		queryLC = mysql.format(queryLC,queryLCData);
		
		var servingInsts = 'SELECT LOC_INST_ID from ENQUIRY_TRANX as a where ??=?';
		var servingData = ['LOC_ENQ_ID',req.params.enqid];
		servingInsts = mysql.format(servingInsts,servingData);
		var detailsShared = [];

		sqlGetCall(servingInsts, function(listed){
			listed.forEach(function(i,k){
				detailsShared.push(i.LOC_INST_ID);
			});
			detailsShared.push(Number(req.params.currentinstid));
		});
		sqlGetCall(queryLC, function(all){
			var recommendedInstitute = all.filter(function(obj) { 
				return detailsShared.indexOf(obj.LOC_INST_ID) == -1; 
			});		
			res.json({status: true, results: recommendedInstitute});
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