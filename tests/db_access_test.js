"use_strict";

var sqlite3 = require("sqlite3");

var db_access = require('./../src/db_access');
var create_db = require('./../src/create_db');
var game_utils = require('./../src/game_utils');

var db = new sqlite3.Database(":memory:");

module.exports = {
    setUp: function(callback) {
        db_access.setDatabase(db);
        create_db.setDatabase(db);
        var table_list = ['files', 'session', 'player', 'move'];
        create_db.dropPreviouslyCreatedTables(table_list, callback);
    },

    addMove: function(test) {
        var player_id = 1;
        var move = game_utils.create_move(player_id, 1, 2, 3, "Bus");

        db_access.addMoveObject(move, callback);

        function callback(err) {
            db_access.getMoves(1, function(err, rows) {
                var actual_move = rows[0];
                test.deepEqual(actual_move, move);
                test.done();
            });
        }
    },

    addTwoMoves: function(test) {
        var player_id = 1;
        var move_one = game_utils.create_move(player_id, 1, 1, 2, "Taxi");
        var move_two = game_utils.create_move(player_id, 2, 2, 3, "Underground");


        db_access.addMoveObject(move_one, addMoveTwo);

        function addMoveTwo() {
            db_access.addMoveObject(move_two, callback);
        }

        function callback() {
            db_access.getMoves(player_id, function(err, rows) {
                var actual_move_one = rows[0];
                var actual_move_two = rows[1];
                test.deepEqual(actual_move_one, move_one);
                test.deepEqual(actual_move_one, move_one);
                test.done();
            });
        }
    },

    addPlayerAndGetPlayer: function(test) {
        var player_id = 1;
        var tickets = game_utils.create_tickets(1, 2, 3, 4, 5);
        var player = game_utils.create_player(player_id, 1, "X", 1, tickets);

        db_access.addPlayerObject(player, getPlayerAndTest);

        function getPlayerAndTest(err, actual_player_id) {
            test.equal(actual_player_id, player_id);
            db_access.getPlayer(player_id, function(err, player_row) {
              var actual_player = game_utils.create_player_from_row(player_row);
              test.deepEqual(actual_player, player);
              test.done();
            });
        }
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
