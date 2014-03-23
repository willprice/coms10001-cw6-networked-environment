// Description of the Server File
// ------------------------------


// To understand this document, you will need to look at the documentation
// for both the `GameState` object and the `ServerState` object as well as the protocol definition
// 1. [GameState](../out/GameState.html)
// 2. [ServerState](../out/ServerState.html)
// 3. [Protocol](../out/tutorial-protocol.html)


"use strict";




// Initialising the server
// -----------------------




// Here we require the modules that will be needed for the
// game. The game state is equivalent to the 
// `GameState` object 
// you have written for Coursework 5. It allows incoming requests
// to be checked for validity with respect to the game rules.
// For example, it will check if a certain move is valid
var GameState   = require('./game_state');
// this creates a new GameState Object
var game_state = new GameState();


// The `ServerState` handles two things. First, the current
// state of the game. Second, it decodes the incoming requests.
// When a request is made by a client, this object finds out what
// sort of request it is. It checks its state to find out
// if that request is valid and if it is, it emits a corresponding event.
// We attach event listeners to this class which are functions
// that are triggered when an event is fired 
var ServerState = require('./server_state');

// Creating a new GameState object
var server_state = new ServerState();

// The following lines are where we attach listeners to the
// `ServerState` class. For each of the functions, t
// he first argument is the name of the
// event we are listening for, the second is the name of the
// function that will be triggered when that event is emitted
// by the `ServerState`
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

// The `db access` is the module that you have written for part one
// of this coursework.
// You will need to put your `db_access` module in the same file
// as this server script for this require function to work
var db_access = require('./db_access');





// Here we set up the server and wait for incoming connections
// The parameter passed into `net.createServer` is a callback function
// this function is triggered every time a client joins the server
var port = 8124;
var net = require('net');
var server = net.createServer(connect);
server.listen(port);



// This is the callback function that is triggered every time a new client
// connects with the server. The function sets the encoding of the client
// and importantly attaches an event listener to the client. The event
// listener waits for `'data'` events (a request from the client). When it gets a data event, the
// `receive` function is triggered. The `receive` function then passes
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

// Below are the descriptions of the functions that are triggered when 
// the `ServerState` emits an event. Most of these functions are for you
// to complete. The ones that have been done for you are `onInitialise`
// `onGet` and `onInvalid`. 
// When writing the code for the functions you need to implement, carefully
// read the descriptions of what to do and consult all the documentation.
// In addition, you should look at the functions that have been implemented
// for you to better understand what you need to do



// This function is triggered when a  `'winning_player'` event is emitted
// by the `ServerState`. First, we must check the `GameState` to
// see if it the game has finished using the `game_state.isGameOver()` function. 
// If it has, the winning player id must be retrieved
// from the `GameState` using the `game_state.getWinningPlayer()` function.
// This is the written to the client
function onWinningPlayer(client)
{
	// CODE GOES HERE
}

// This function is triggered when a `'reset'` event is emitted by the `ServerState`.
// This function needs to reset both the `GameState` using the `game_state.reset()` function
// and the `ServerState` using the `server_state.reset()` function.
// If this has been done OK, write it to the client
function onReset(client)
{
	// CODE GOES HERE
}


// This function is triggered when a `'game_over'` event is emitted by the
// `ServerState`. It must check the `GameState` using the `game_state.isGameOver()` function
// to see if the game has finished. The result of this
// is then written to the client and the `ServerState` must be updated
// using the `server_state.setState(state)` function
function onGameOver(client)
{
	// CODE GOES HERE
}


// This function is triggered by a `'next_player'` event emitted by the `ServerState`
// It must use the `GameState` function `game_state.getNextPlayer()` to find out 
// who the next player is and write it to the client
function onNextPlayer(client)
{
	// CODE GOES HERE
}


// This function is triggered by a `'move'` event emitted from the `ServerState`. 
// It must first use the `GameState` to move the player using the `game_state.movePlayer(id,target_id,ticket)`
// function. If the function returns true, it must then use the `db_access` module to 
// write the moves to the database. 
// This includes 
//
// 1. Updating the player positions and ticket numbers
// 2. Adding the move to the move table
//
// If the `game_state.movePlayer(id,target_id,ticket)` function returns false this must be communicated 
// to the client
function onMove(client, args)
{
	// CODE GOES HERE
}





// Function triggered by a `'join'` event emitted from the `ServerState`. This
// function must use the `GameState` to get the list of player ids using the 
// `game_state.getPlayerIds()` function. It then
// must parse this list into the format expected by the protocol and write it
// to the client. This function must also update the
// state of the `GameState` using the function `game_state.startRunning()` and
// set the state of the `ServerState` to be running as well using the
// `server_state.setState(state)` function
function onJoin(client, args)
{
	// CODE GOES HERE
}






// Function triggered on a `'get'` event triggered by the server. The 
// function checks for the type of the file to get and then calls the necessary
// functions to get the data. The data is then written to the client
// depending on the type of data (text or binary)
function onGet(client, args)
{
    if(args.item === "game")
    {
        game_state_init.getWholeGameState(args.session_id, function(data){
            sendText(data);
        });
	}
	else
	{
		db_access.getFile(args.files_id, args.item, function(err, dump) {
			if(err) throw err;
			if(args.item === "map") sendBinary(dump);
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

// This function is triggered when an `'initialise'` event is emitted by
// the `ServerState`. This function must do a number of things:
// 1. Call the `game_state_init.initialiseGame()` function to get the necessary 
// information about the new session. This includes the session information
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

// This function is triggered when the `ServerState` gets an invalid
// request. It simply writes the error to the client
function onInvalid(client, err)
{
	client.write("0," + err.code + "," + err.message + "\n");
}

