"use_strict";

var sqlite3 = require("sqlite3");

var db_access = require('./../src/db_access');
module.exports = {
  setUp: function(callback) {
    this.db = new sqlite3.Database('test.db');
    db_access.addSession("test_session", 1, callback);
  },

  tearDown: function(callback) {
    this.db.close(callback);
  },

  testQueryingNonExistantFileThrowsError: function(test) {
    var files_id = 1;
    var file_type = 'pos';
    var error_type ='positions';
    test.throws(
        db_access.getFile(files_id, error_type,
          function(err) {
            if (err) { throw err; }
            test.done();
          }),
        error_type);
  },

  testQueryingFirstFile: function(test) {
    var files_id = 1;
    var file_type = 'pos';
    db_access.getFile(files_id, file_type, function(err, data) {
      if(err) {
        test.done();
        throw err;
      }
      test.equal(data.split("\n", 10));
      test.done();
    });
  }
};

function dbCallback(err, data)
{
  if(err) { throw err; }

  console.log("Extracted File has " + data.length + " characters");
  var data_lines = data.split("\n");
  console.log("Extracted File has " + data_lines.length + " lines");
}

// we now query into the database using one of the functions
// that is written in the db_access module
