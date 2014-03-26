"use_strict";

var sqlite3 = require("sqlite3");

var db_access = require('./../src/db_access');
var create_db = require('./../src/create_db');

var db = new sqlite3.Database(":memory:");

module.exports = {
    setUp: function(callback) {
        "use strict";
        db_access.setDatabase(db);
        create_db.setDatabase(db);
        var table_list = ['files', 'session', 'player', 'move'];
        create_db.dropPreviouslyCreatedTables(table_list, callback);
    },

    testAddMoveAndGetMove: function(test) {
        "use strict";
        var move_id = 1;
        var start_location = 2;
        var end_location = 3;
        var ticket_type = "Bus";
        var player_id = 1;

        db_access.addMove(player_id, start_location, end_location,
            "Bus", function(err) {

            db_access.getMoves(1, function(err, rows) {
                var move = rows[0];
                test.equal(move.move_id, move_id);
                test.equal(move.start_location, start_location);
                test.equal(move.end_location, end_location);
                test.equal(move.ticket_type, ticket_type);
                test.equal(move.player_id, player_id);
                test.done();
            });
        })
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
