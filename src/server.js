// Description of the Server File
// ------------------------------
"use strict";

// Initialising the server
// -----------------------





// Here we require the modules that will be needed for the
// game. The game state is equivalent to the `GameState` object 
// you have written for Coursework 5. It allows incoming requests
// to be checked for validity with respect to the game rules.
// For example, it will check if a certain move is valid
var GameState   = require('./game_state');
// this creates a new GameState Object
var game_state = new GameState();


// The server state handles two things. First, the current
// state of the game. Secondly it decodes the incoming requests.
// As a request is made by a client, this object find out what
// sort of request it is. It checks its state to find out
// if that request is valid and if it is it emits a corresponding event.
// We attach event listeners to this class which are functions
// that are triggered when an event is fired 
var ServerState = require('./server_state');

// Creating a new GameState object
var server_state = new ServerState();

// The following lines are where we attach listeners to the
// `ServerState` class. The first argument is the name of the
// event we are listening to, the second is the name of the
// function that will be triggered when that event is triggered
server_state.on('invalid_request', onInvalid);
server_state.on('initialise', onInitialise);
server_state.on('get_file', onGet);
server_state.on('join', onJoin);
server_state.on('move', onMove);
server_state.on('next_player', onNextPlayer);
server_state.on('game_over', onGameOver);
server_state.on('winning_player', onWinningPlayer);
server_state.on('reset', onReset);


// The following module provides a set of helper functions that
// are needed to set up the game
var game_state_init = require("./game_state_init");

// The db access is the module that you have written for part one.
// You will need to put your db_access module in the same file
// as this server script for this require to work
var db_access = require('./db_access');





// Set up the server and wait for incoming connections
// The parameter passed into `net.createServer` is a callback function
// this function is triggered everytime a client joins the server
var port = 8124;
var net = require('net');
var server = net.createServer(connect);
server.listen(port);



// This is the callback function that is triggered every time a new client
// connects with the server. The function sets the encoding of the client
// and importantly attaches an event listener to the client. The event
// listener waits for 'data' events. When it gets a data event, the
// `recieve` function is triggered. The `recieve` function then passes
// the client object and the text that has come in as the request to the
// `ServerState` object. The `ServerState` will now process the 
// request 
function connect(client) {
	client.setEncoding("utf8");
	client.name = client.remoteAddress + ":"+ client.remotePort;
	client.on('data', receive);
	console.log("[Message]: Hello Client " + client.name);	
	function receive(request) { server_state.processRequest(client, request); }
}



// Server State Event Callbacks
// ----------------------------


// This function is triggered when the `ServerState` gets an invalid
// request. It simply writes the error to the client
function onInvalid(client, err)
{
	client.write("0," + err.code + "," + err.message + "\n");
}

// This function is triggered when a  `winning_player` event is emitted
// by the `ServerState`. First, we must check the state of the game to
// see if it is finished. If it is, the winning player id must be retrieved
// from the games state and written to the client output
function onWinningPlayer(client)
{
	// CODE GOES HERE
}

// This function is triggered when a `reset` event is emitted by the `ServerState`.
// This function needs to reset both the `GameState` and the `ServerState`
// and write a response to the client
function onReset(client)
{
	// CODE GOES HERE
}


// This function is triggered when a `game_over` event is emitted by the
// `ServerState`. It must check the `GameState` to see if the game has finished.
// If it has, this is written to the client.
function onGameOver(client)
{
	// CODE GOES HERE
}


// This funciton is triggered by a 'next_player' event emitted by the `ServerState`
// It must use the `GameState` to find out who the next player is and write it to 
// the client
function onNextPlayer(client)
{
	// CODE GOES HERE
}


// This function is triggered by a `move` event emitted from the `ServerState`. 
// It must first use the `GameState` to move the player using the `movePlayer(id,target_id,ticket)`
// function. If the function returns true, it must then use the `db_access` module to 
// write the moves to the database. This includes updating the player positions
// and ticket numbers, and adding a move into the move table. If the move is
// invalid with respect to the `GameState` this must be expressed to the client
function onMove(client, args)
{
	// CODE GOES HERE
}





// Function triggered by a `join` event emitted from the `ServerState`. This
// function must use the game state to get the list of player ids. It then
// must parse this list into the format expected by the protocol and write it
// to the client. This function must also update the state of the `GameState` setting
// it to `initialised`
function onJoin(client, args)
{
	// CODE GOES HERE
}






// Function triggered on a `get` event triggered by the server. The 
// function checks for the type of the file to get and then calls the nessesary
// functions to ge the data. The data is then written to the client
// depending on the type of data (text or binary)
function onGet(client, args)
{
	if(args.item == "game")
	{
	   	game_state_init.getWholeGameState(args.session_id, function(data){
			sendText(data);
		});
	}
	else
	{
		db_access.getFile(args.files_id, args.item, function(err, dump) {
			if(err) throw err;
			if(args.item == "map") sendBinary(dump);
			else sendText(dump);	
			return;
		});
	}


	function sendText(dump)
	{
		client.write('1,'+dump.length + "\n");
		client.write(dump, function(){
			console.log("[Message]: Finished Writing File");
			return;
		});

	}

	function sendBinary(dump)
	{
		var buf = new Buffer(dump);
		client.write('1,'+buf.length + "\n");
		client.write(buf, function() {
			console.log("[Message]: Finished Sending Image File");
			return;
		});
	}
}

// This function is triggered when an `initialise` event is emitted by
// the `ServerState`. This function must do a number of things:
// 1. Call the `game_state_init.initialiseGame` function to get the nessesary 
// information about the new session. This includes the session informatio
// and the player information
// 2. It sets the session_id and files_id of the `ServerState`
// 3. It sets the graph of the `GameState`
// 4. It adds all the players into the `GameState`
// 5. Sets the state of the `ServerState` to `initialised`
// 6. Writes the success of this process to the client
function onInitialise(client, args)
{
	console.log("[Message]: Initialising Game");


	game_state_init.initialiseGame(args, function(err, output) {
		if(err) throw err;


		server_state.setSessionId(output.session_id);
		server_state.setFilesId(args.files_id);

		game_state.setGraph(output.graph);
		for(var i = 0; i < output.players.length; i++)
		{
			game_state.addPlayer(output.players[i]);
		}

		console.log("[Message]: Game Initialised");

		client.write('1,1,Game Initialised\n');
		server_state.setState(server_state.INITIALISED);
	});
}

