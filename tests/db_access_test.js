"use_strict";

var sqlite3 = require("sqlite3");

var db_access = require('../src/db_access');
var create_db = require('../src/create_db');
var game_utils = require('../src/game_utils');

var db = new sqlite3.Database(":memory:");

module.exports = {
    setUp: function(callback) {
        db_access.setDatabase(db);
        create_db.createNewDatabase(db, callback);
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

    addPlayer: function(test) {
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
    },

	addSession: function(test) {
		var session_id = 1;
		var files_id = 1;
		var session = game_utils.create_session(session_id, "test_session", 1);
		db_access.addSessionObject(session, getSessionAndTest);

		function getSessionAndTest(err, actual_session_id) {
			test.equal(actual_session_id, session.session_id);
			db_access.getSession(session_id, function(err, session_row) {
				test.deepEqual(session_row, session);
				test.done();
			});
		}
	},

	getPlayerIds: function(test) {
		var player_id_1 = 1;
		var player_id_2 = 2;

		var player_1_tickets = game_utils.create_tickets(1, 2, 3, 4, 5);
		var player_2_tickets = game_utils.create_tickets(2, 3, 4, 5, 6);

		var session_id = 1;
		
		var session = game_utils.create_session(1, "test_session", 1);
		var player_1 = game_utils.create_player(player_id_1, session_id, "D",
				1, player_1_tickets);
		var player_2 = game_utils.create_player(player_id_2, session_id, "D",
				1, player_2_tickets);

		db_access.addSessionObject(session, function(err, id) {
			addPlayerObjects();
		});

		function addPlayerObjects() {
			db_access.addPlayerObject(player_1, function(err, id) {
				db_access.addPlayerObject(player_2, getAndTestPlayerIds);
			});
		}

		function getAndTestPlayerIds() {
			db_access.getPlayerIds(session_id, function(err, player_ids) {
				var actual_player_id_1 = player_ids[0].player_id;
				var actual_player_id_2 = player_ids[1].player_id;
				test.equal(actual_player_id_1, player_id_1);
				test.equal(actual_player_id_2, player_id_2);
				test.done();
			});
		}
	},

	setPlayerLocation: function(test) {
		var start_location = 1;
		var new_location = 2;

		var tickets = game_utils.create_tickets(1, 2, 3, 4, 5);
		var player = game_utils.create_player(1, 1, "D", start_location, tickets);

		db_access.addPlayerObject(player, function(err, id) {
			db_access.setPlayerLocation(player.id, new_location, getAndTestPlayerLocation);
		});

		function getAndTestPlayerLocation(err) {
			db_access.getPlayerLocation(player.id, function(err, actual_location) {
				test.equal(actual_location, new_location);
				test.done();
			});
		}

	}
};

process.on('uncaughtException', function(err) {
	console.error(err.stack);
});

function dbCallback(err, data)
{
  if(err) { throw err; }

  console.log("Extracted File has " + data.length + " characters");
  var data_lines = data.split("\n");
  console.log("Extracted File has " + data_lines.length + " lines");
}
