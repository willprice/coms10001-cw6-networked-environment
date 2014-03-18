// db_access.js
// ------------
"use strict";

// Create the connection to the database.
var sql = require("sqlite3");
var db = new sql.Database("test.db");


// function to get a file from the files table
exports.getFile = function (files_id, type, callback) {
    db.get("SELECT " + type + " FROM files WHERE files_id=?", [files_id], function (err, data) {
        if (err) {
            return callback(err);
        }
        callback(null, data[type]);
    });
};

function logAndRunCallback(callback, table_name) {
    return function (err, data) {
        if (err) {
            callback(err);
        }

        console.log("[Message]: " + table_name + " added properly!");
        callback(null);
    };
}

function addMove(player_id, previous_location, target_location, ticket, callback) {
    var sql_statement = "INSERT INTO move VALUES (?, ?, ?, ?, ?)";

    db.run(sql_statement, [null, player_id, previous_location, target_location, ticket],
        logAndRunCallback(callback, "moves"));
}


