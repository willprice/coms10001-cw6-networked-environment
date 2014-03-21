"use_strict";

var sql = require('sqlite3');
var test = require('unit.js');

var db_access = require('./db_access');
var create_db = require('./create_db');

function createTestTable()
{
    var db = new sql.Database(':memory:');
}

function dbCallback(err, data)
{
	if(err) { throw err; }

	console.log("Extracted File has " + data.length + " characters");
	var data_lines = data.split("\n");
	console.log("Extracted File has " + data_lines.length + " lines");
}






// we now query into the database using one of the functions
// that is written in the db_access module
var files_id = 1;
var file_type = 'pos';
db_access.getFile(files_id, file_type, dbCallback);



// lets now call the get files function again but purposely invoke an
// error. UNCOMMENT BELOW
//var error_type ='positions';
//db_access.getFile(files_id, error_type, dbCallback);

