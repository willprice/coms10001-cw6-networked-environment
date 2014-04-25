"use strict";

// Create the connection to the database.
var sql = require("sqlite3");
var db = new sql.Database("test.db");


var db_access = {};
/**
 * @param {int} player_id
 * @param {int} previous_location
 * @param {int} target_location
 * @param {string} ticket
 * @param {function(err)} callback
 */
db_access.addMoveObject = function(move, callback) {
   db_access.addMove(move.player_id, move.start_location, move.end_location,
   move.ticket_type, callback);
};

db_access.addMove = function (player_id, previous_location, target_location, ticket, callback) {
    var sql_statement = "INSERT INTO move VALUES (?, ?, ?, ?, ?)";

    db.run(sql_statement, [null, previous_location, target_location, ticket, player_id],
        function (err) {
            logAndRunCallback(err, "move added properly!", callback);
        }
    );
};

db_access.addPlayerObject = function(player, callback) {
    db_access.addPlayer(player.session_id, player.type,
        player.location, player.tickets, callback);
};

/**
 * @param {int} session_id
 * @param {String} player_type
 * @param {int} player_location
 * @param {tickets} tickets
 * @param {function(err, player_id)} callback
 */
db_access.addPlayer = function (session_id, player_type, player_location, tickets, callback) {
    var taxi_tickets = tickets.Taxi;
    var bus_tickets = tickets.Bus;
    var underground_tickets = tickets.Underground;
    var double_move_tickets = tickets.DoubleMove;
    var black_tickets = tickets.SecretMove;


    var sql_statement = "INSERT INTO player VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.run(sql_statement, [null, player_type, player_location, taxi_tickets, bus_tickets,
        underground_tickets, double_move_tickets, black_tickets, session_id],
        function(err) {
            var args;
            if (!err) {
                args = [this.lastID];
            }
            logAndRunCallback.call(null, err, "player added properly!", callback, args);
        }
    );
};

db_access.addSessionObject = function(session, callback) {
    db_access.addSession(session.name, session.files_id, callback);
};

/**
 * @param {string} session_name
 * @param {int} files_id
 * @param {function(err, session_id)} callback
 */
db_access.addSession = function (session_name, files_id, callback) {
    var sql_statement = "INSERT INTO session VALUES (?, ?, ?)";

    db.run(sql_statement, [null, session_name, files_id],
    function(err) {
        var args;
        if (!err) {
            args = [this.lastID];
        }
        logAndRunCallback.call(null, err, "session added properly!", callback, args);
    });
};

/**
 * function to get a file from the files table
 * @param {int} files_id
 * @param {string} type
 * @param {function(err, data)} callback
 */
db_access.getFile = function (files_id, type, callback) {
    db.get("SELECT " + type + " FROM files WHERE files_id = ?", [files_id], function (err, row) {
        if (err) {
            return callback(err);
        }
        callback(err, row[type]);
    });
};

/**
 *
 * @param {int} player_id
 * @param {function(err, db_rows)} callback
 */
db_access.getMoves = function (player_id, callback) {
    var sql_statement = "SELECT * FROM move WHERE player_id = ?";

    db.all(sql_statement, [player_id], function (err, rows) {
        logAndRunCallback(err, "got move correctly!", callback, [rows]);
    });
};

/**
 *
 * @param {int} player_id
 * @param {function(err, db_row)} callback
 */
db_access.getPlayer = function (player_id, callback) {
    var sql_statement = "SELECT * FROM player WHERE player_id = ?";

    db.get(sql_statement, [player_id], function (err, row) {
        logAndRunCallback(err, "got player correctly!", callback, [row]);
    });
};

/**
 * @param {int} session_id
 * @param {function(err, db_rows) } callback
 */
db_access.getPlayerIds = function (session_id, callback) {
    var sql_statement = "SELECT player_id FROM player WHERE session_id = ?";

    db.all(sql_statement, [session_id], function (err, rows) {
        logAndRunCallback(err, "got player ids correctly!", callback, [rows]);
    });
};

/**
 * @param {int} player_id
 * @param {function(err, location)} callback
 */
db_access.getPlayerLocation = function (player_id, callback) {
    var sql_statement = "SELECT location FROM player WHERE player_id = ?";

    db.get(sql_statement, [player_id], function (err, row) {
        logAndRunCallback(err, "got player location properly!", callback, [row.location]);
    });
};

/**
 * @param {int} session_id
 * @param {function(err, db_row)} callback
 */
db_access.getSession = function (session_id, callback) {
    var sql_statement = "SELECT * FROM session WHERE session_id = ?";

    db.get(sql_statement, [session_id], function (err, db_row) {
        logAndRunCallback(err, "got session properly!", callback, [db_row]);
    });
};

/**
 * @param {int} player_id
 * @param {int} new_location
 * @param {function(err)} callback
 */
db_access.setPlayerLocation = function (player_id, new_location, callback) {
    var sql_statement = "UPDATE player SET location = ? WHERE player_id = ?";

    db.run(sql_statement, [new_location, player_id], function (err) {
        logAndRunCallback(err, "updated location properly!", callback);
    });
};

function logAndRunCallback(err, message, callback, callback_args) {
    if (!err) {
        console.log("[Message]: " + message);
    } else {
        console.log("[Error]: args: ");
        console.log(arguments);
    }
    if (callback) {
        console.log("Running callback!");
        callback.apply(null, [err].concat(callback_args));
    }
}

db_access.setDatabase = function(database) {
    db = database;
};

db.run("PRAGMA foreign_key_check;");
module.exports = db_access;
