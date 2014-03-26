// db_access.js
// ------------
"use strict";

// Create the connection to the database.
var sql = require("sqlite3");
var db = new sql.Database("test.db");

function logAndRunCallback(err, message, callback, args) {
    if (!err) {
        console.log("[Message]: " + message);
    } else {
        console.log("[Error]");
    }
    callback.apply(null, [err].concat(args));
}

exports.setDatabase = function(database) {
    db = database;
};

// function to get a file from the files table
exports.getFile = function (files_id, type, callback) {
    db.get("SELECT " + type + " FROM files WHERE files_id = ?", [files_id], function (err, row) {
        if (err) {
            return callback(err);
        }
        callback(err, row[type]);
    });
};

exports.addMove = function (player_id, previous_location, target_location, ticket, callback) {
    var sql_statement = "INSERT INTO move VALUES (?, ?, ?, ?, ?)";

    db.run(sql_statement, [null, previous_location, target_location, ticket, player_id],
        function (err) {
            logAndRunCallback(err, "move added properly!", callback);
        }
    );
};

exports.addPlayer = function (session_id, player_type, player_location, tickets, callback) {
    var taxi_tickets = tickets.Taxi;
    var bus_tickets = tickets.Bus;
    var underground_tickets = tickets.Underground;
    var double_move_tickets = tickets.DoubleMove;
    var black_tickets = tickets.SecretMove;


    var sql_statement = "INSERT INTO player VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.run(sql_statement, [null, player_type, player_location, taxi_tickets, bus_tickets,
        underground_tickets, double_move_tickets, black_tickets, session_id],
        function(err) {
            logAndRunCallback(err, "player added properly!", callback, [this.lastID]);
        }
    );
};

exports.addSession = function (session_name, files_id, callback) {
    var sql_statement = "INSERT INTO session VALUES (?, ?, ?)";

    db.run(sql_statement, [null, session_name, files_id],
    function(err) {
        logAndRunCallback(err, "session added properly! (Fuck off jamie)", callback, this.lastID);
    });
};

exports.getMoves = function (player_id, callback) {
    var sql_statement = "SELECT * FROM move WHERE player_id = ?";

    db.all(sql_statement, [player_id], function (err, rows) {
        logAndRunCallback(err, "got move correctly!", callback, [rows]);
    });
};

exports.getPlayer = function (player_id, callback) {
    var sql_statement = "SELECT * FROM player WHERE player_id = ?";

    db.get(sql_statement, [player_id], function (err, row) {
        logAndRunCallback(err, "got player correctly!", callback, [row]);
    });
};

exports.getPlayerIds = function (session_id, callback) {
    var sql_statement = "SELECT player_id FROM players WHERE session_id = ?";

    db.all(sql_statement, [session_id], function (err, rows) {
        logAndRunCallback(err, "got player ids correctly!", callback [rows]);
    });
};

exports.getPlayerLocation = function (player_id, callback) {
    var sql_statement = "SELECT location FROM players WHERE player_id = ?";

    db.get(sql_statement, [player_id], function (err, row) {
        logAndRunCallback(err, "got player location properly!", callback, [row]);
    });
};

exports.getSession = function (session_id, callback) {
    var sql_statement = "SELECT * FROM session WHERE session_id = ?";

    db.get(sql_statement, [session_id], function (err, db_row) {
        logAndRunCallback(err, "got session properly!", callback, [db_row]);
    });
};

exports.setPlayerLocation = function (player_id, new_location, callback) {
    var sql_statement = "UPDATE player SET location = ? WHERE player_id = ?";

    db.run(sql_statement, [new_location, player_id], function (err) {
        logAndRunCallback(err, "updated location properly!", callback);
    });
};
