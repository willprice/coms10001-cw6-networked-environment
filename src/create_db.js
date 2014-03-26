"use strict";
var sql = require("sqlite3");
var db = new sql.Database("test.db");

module.exports = {
    setDatabase: function(database) {
        db = database;
    },

    dropPreviouslyCreatedTables: function (table_list, callback)
    {
        var num_tables = table_list.length;
        var tables_dropped = 0;
        function logTableDropIncrementCount(err) {
            if (err) { throw err; }
            console.log("Dropped table");
            tables_dropped++;
        }

        function ifAllTablesDroppedCreateFilesTable() {
            if (tables_dropped === num_tables) {
                console.log("Finished dropping tables");
                this.createFilesTable(callback);
            }
        }

        function dropTablesCallback(err, data) {
            logTableDropIncrementCount(err);
            ifAllTablesDroppedCreateFilesTable.call(this);
        }

        for (var i = 0; i < num_tables; i++) {
            db.run("DROP TABLE IF EXISTS " + table_list[i], dropTablesCallback.bind(this));
        }
    },

  createFilesTable: function(callback)
    {
        var sql_stmt = "CREATE TABLE files (" +
            "files_id INTEGER PRIMARY KEY, " +
            "name TEXT, " +
            "graph TEXT, " +
            "pos TEXT, " +
            "map BLOB )";

        function logAndCreateSessionTable(err) {
            if (err) { throw err; }
            console.log("Table 'files' created");
            this.createSessionTable(callback);
        }

        db.run(sql_stmt, logAndCreateSessionTable.bind(this));
    },

    createSessionTable: function(callback)
    {
        var sql_stmt = "CREATE TABLE session (" +
            "session_id INTEGER PRIMARY KEY," +
            "name TEXT, " +
            "files_id INTEGER, " +
            "FOREIGN KEY(files_id) REFERENCES files(files_id))";

        function logAndCreatePlayerTable(err) {
            if (err) { throw err; }
            console.log("Table 'session' created");
            this.createPlayerTable(callback);
        }

        db.run(sql_stmt, logAndCreatePlayerTable.bind(this));
    },

    createPlayerTable: function(callback)
    {
        var sql_statement = "CREATE TABLE player (" +
            "player_id INTEGER PRIMARY KEY, " +
            "type TEXT, " +
            "location INTEGER, " +
            "taxi_tickets INTEGER, " +
            "bus_tickets INTEGER, " +
            "underground_tickets INTEGER, " +
            "double_tickets INTEGER, " +
            "secret_tickets INTEGER, " +
            "session_id INTEGER, " +
            "FOREIGN KEY(session_id) REFERENCES session(session_id))";

        function logAndCreateMoveTable(err) {
            if (err) { throw err; }
            console.log("Table 'player' created");
            this.createMoveTable(callback);
        }

        db.run(sql_statement, logAndCreateMoveTable.bind(this));
    },

    createMoveTable: function(callback) {
        var sql_statement = "CREATE TABLE move (" +
            "move_id INTEGER PRIMARY KEY, " +
            "start_location INTEGER, " + "end_location INTEGER, " +
            "ticket_type TEXT, " +
            "player_id INTEGER, " +
            "FOREIGN KEY(player_id) REFERENCES player(player_id))";

        function log(err) {
            if (err) { throw err; }
            console.log("Table 'move' created");
            callback();
        }

        db.run(sql_statement, log);

    }
};

if (require.main === module) {
    var table_list = ['files', 'session', 'player', 'move'];
    exports.dropPreviouslyCreatedTables(table_list);
}
