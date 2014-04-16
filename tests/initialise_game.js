var create_db = require('../src/create_db');
var db_access = require('../src/db_access');
var game_utils = require('../src/game_utils');
var output = require('../src/output');
var sqlite3 = require('sqlite3');


module.exports = {
    setUp: function(callback) {
        var db = new sqlite3.Database(':memory:');
        create_db.createNewDatabase(db, callback);
        db_access.setDatabase(db);
    },

    initialiseGame: function() {
        var number_of_detectives = 5;
        var session_id = 1;
        var mr_x_player_id = 1;
        db_access.addSessionObject(game_utils.create_session(session_id, "Test 5 detectives, 1 mr x", 1), addMrX);

        function addMrX() {
            var mr_x_tickets = game_utils.create_tickets(0, 0, 0, 2, 5);
            var mr_x = game_utils.create_player(mr_x_player_id, session_id, "X", 1, mr_x_tickets);
            db_access.addPlayerObject(mr_x, addDetectives);
        }

        function addDetectives() {
            var detective_tickets = game_utils.create_tickets(11, 8, 4, 0, 0);
            var callback;
            for (var i = 0; i < number_of_detectives; i++) {
                if (i === number_of_detectives - 1) {
                    callback = getSession;
                }
                db_access.addPlayerObject(game_utils.create_player(i + 2, session_id, "D", i + 2, detective_tickets),
                    callback);
            }
        }

        function getSession() {
            db_access.getSession(session_id, testAndPrintSession);
        }

        function testAndPrintSession(err, db_row) {
            output.printHeader("Session entry");
            output.print(db_row);
            db_access.getPlayer(mr_x_player_id, testAndPrintMrX);

        }


        function testAndPrintMrX(err, db_row) {
            output.printHeader("Mr X player entry");
            output.print(db_row);
            printDetectives();
        }

        function printDetectives() {
            output.printHeader("Detective entries");
            for (var id = 2; id < number_of_detectives + 2; id++) {
                db_access.getPlayer(id, printDetective);
            }
        }

        function printDetective(err, db_row) {
            output.print(db_row);
        }
    }
};

if (require.main === module) {
    module.exports.setUp(
        module.exports.initialiseGame
    );
}
