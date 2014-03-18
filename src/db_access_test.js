"use_strict";

// here we define the callback function that is going to be passed into
// the getFile db_access function. This function will be triggered 
// when the getFile function has performed its database query
function dbCallback(err, data)
{
	// first we check if the db function has produced an error
	// if it has we throw it so that we can see the error
	if(err) throw err;

	// if we get here we know the function was successful so 
	// we can now acces the data
	console.log("Extracted File has " + data.length + " characters");
	data_lines = data.split("\n");
	console.log("Extracted File has " + data_lines.length + " lines");


}




// first we require the db_access module that we have created. By 
// doing this we are exposing the functions to be able to
// use in this script
var db_access = require('./db_access');


// we now query into the database using one of the functions
// that is written in the db_access module
var files_id = 1;
var file_type = 'pos';
db_access.getFile(files_id, file_type, dbCallback);



// lets now call the get files function again but purposely invoke an
// error. UNCOMMENT BELOW
//var error_type ='positions';
//db_access.getFile(files_id, error_type, dbCallback);

