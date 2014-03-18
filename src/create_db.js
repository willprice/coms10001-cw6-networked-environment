"use_strict";

function dropPreviouslyCreatedTables(table_list)
{
    var num_tables = table_list.length;
    var tables_dropped = 0;

    for(var i = 0; i < num_tables; i++)
    {
        db.run("DROP TABLE IF EXISTS " + table_list[i], function(err,data) {
            if(err) { throw err; }

            console.log("Dropped table");

            tables_dropped++;

            if(tables_dropped === num_tables)
            {
                console.log("Finished dropping tables");
                createFilesTable();
            }
        });
    }
}

function createFilesTable()
{
    var sql_stmt = "CREATE TABLE files (" +
        "files_id INTEGER PRIMARY KEY, " +
        "name TEXT, " +
        "graph TEXT, " +
        "pos TEXT, " +
        "map BLOB )";

    db.run(sql_stmt, function(err) {
        if(err) { throw err; }

        console.log("Table 'files' created");
        createSessionTable();
    });
}

function createSessionTable()
{
    var sql_stmt = "CREATE TABLE session (" +
        "session_id INTEGER PRIMARY KEY," +
        "name TEXT, " +
        "files_id INTEGER, " +
        "FOREIGN KEY(files_id) REFERENCES files(files_id))";

    db.run(sql_stmt, function(err) {
        if(err) { throw err; }

        console.log("Table 'session' created");

        createPlayerTable();
    });
}

function createPlayerTable()
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

    db.run(sql_statement, function(err) {
        if (err) { throw err; }

        console.log("Table 'player' created");

        createMoveTable();
    });
}

function createMoveTable() {
    var sql_statement = "CREATE TABLE move (" +
        "move_id INTEGER PRIMARY KEY, " +
        "start_location INTEGER, " +
        "end_location INTEGER, " +
        "ticket_type TEXT, " +
        "player_id INTEGER, " +
        "FOREIGN KEY(player_id) REFERENCES player(player_id))";

    db.run(sql_statement, function(err) {
        if (err) { throw err; }

        console.log("Table 'move' created");
    });

}

var sql = require("sqlite3");
var db = new sql.Database("test.db");
var table_list = ['files', 'session', 'player', 'move'];
dropPreviouslyCreatedTables(table_list);

