// server_state.js
// ---------------
"use strict";

var events = require('events');
var util = require('util');



/**
 * Initialises the state of the server. This will be done only once
 * when the server is turned on
 * @constructor
 * @class
 * @property {int} ServerState.IDLE - The flag that represents the 'idle' state 
 * @property {int} ServerState.INITIALISED - The flag that represents the 'initialised' state
 * @property {int} ServerState.RUNNING - The flag that represents the 'running' state
 * @property {int} ServerState.GAME_OVER - The flag that represents the 'gane_over' state
 * @property {int} state - The current state of the game
 * @property {int} files_id - The id of the files being used for the game
 * @property {int} sessions_id - The id of the sessions being used for the game
 */
function ServerState()
{
		
	this.IDLE = 0;
	this.INITIALISED = 1;
	this.RUNNING = 2;
	this.GAME_OVER = 3;
	this.state = this.IDLE;
	this.files_id = 0;
	this.session_id = 0;
}
util.inherits(ServerState, events.EventEmitter);


/**
 * Resets the state of the game and sets the files_id and 
 * session_id properties to zero
 */
ServerState.prototype.reset = function()
{
	this.state = this.IDLE;
	this.files_id = 0;
	this.session_id = 0;
}

/**
 * Prints out the current state of the game
 */
ServerState.prototype.printState = function()
{
	console.log("State: " + this.state);
}

/**
 * main function for processing incoming requests from the clients. All
 * requests are routed through this function. It does suitable set of 
 * checks on the request to make sure they are valid and then emits a
 * response based on the request. Actions should be triggered by 
 * assigning callbacks to be triggered on the various emitions. 
 *	@param {Client} client A valid client object
 *	@param {string} request The request string that has been passed in by
 *	the client
 *	@tutorial protocol Definition of the protocol used by the server and
 *	client to communicate
 */
ServerState.prototype.processRequest = function(client,request)
{
	events.EventEmitter.call(this);

	// check the request against the stae of the game to check
	// if it is valid
	if(request.length == 0)
	{
		sendInvalid(client, REQUEST_IS_NOT_VALID, 'Request Is Not a Valid String');
		return;
	}

	request = request.replace("\n","");

	console.log("[Request]: " + request);

	var request_parts = request.split(',');
	var action = request_parts[0];


	// do the look up on the action
	if(action == "initialise") this.initialiseCall(client, request_parts);
	else if (action == "get_file") this.getCall(client, request_parts);
	else if (action == "join") this.joinCall(client, request_parts);
	else if (action == "move") this.moveCall(client, request_parts);
	else if (action == "next_player") this.nextPlayerCall(client, request_parts);
	else if (action == "game_over") this.gameOverCall(client, request_parts);
	else if (action == "winning_player") this.winningPlayerCall(client, request_parts);
	else if (action == "reset") this.resetCall(client, request_parts);

}


/**
 * Function to process the winning player request from a client. This function
 * checks that there is a game over state. If there is it will emit
 * the winning player event
 * @param {Client} client The client object that made the request
 * @param {string_list} request_parts The request line split by comma
 * @fires ServerState#winning_player
 */
ServerState.prototype.winningPlayerCall = function(client, request_parts)
{
	// CODE TO GO HERE
}

/**
 * Function to process a reset call from the client. This must first
 * check the stae of the game to ensure that it is resetable. If
 * it is then the 'reset' event is emited
 * @param {Client} client The client object that made the request
 * @param {string_list} request_parts The request line split by comma
 * @fires ServerState#reset
 */
ServerState.prototype.resetCall = function(client, request_parts)
{
	// CODE TO GO HERE
}

/**
 * Function that is called when the client requests 'game_over' comes in. This
 * function checks that the game is running. If it is it fires of the 
 * 'game_over' event
 * @param {Client} client The client object that made the request
 * @param {string_list} request_parts The request line split by comma
 * @fires ServerState#game_over
 */
ServerState.prototype.gameOverCall = function(client, request_parts)
{
	// CODE TO GO HERE
}


/**
 * Function that is called when the client makes the 'next_player' request. This function
 * checks that there is a game running. If it is running the 'next_player' event is fired
 * @param {Client} client The client object that made the request
 * @param {string_list} request_parts The request line split by comma
 * @fires ServerState#next_player
 */
ServerState.prototype.nextPlayerCall = function(client, request_parts)
{
	// CODE TO GO HERE
}



/**
 * Function that is called when the client makes a 'move' request. This function
 * should check that there is a game running. If if is, it should check the 
 * construction of the request to make sure that it matches the expected format: 
 * 'move,player_id,target_id,ticket'. If it does the components of the move
 * should be split up and placed in an object that is fired with a 'move' event.
 * See the signature of the 'move' event to see this object composition
 * @param {Client} client The client object that made the request
 * @param {string_list} request_parts The request line split by comma
 * @fires ServerState#move
 */
ServerState.prototype.moveCall = function(client, request_parts)
{
	//CODE TO GO HERE
}



/**
 * This function is called when a 'join' request comes into the server
 * It checks that the current stae is initialised. If it is it
 * emits the 'join' event
 * @param {Client} client The client object that made the request
 * @param {string_list} request_parts The request line split by comma
 * @fires ServerState#join
 */
ServerState.prototype.joinCall = function(client, request_parts)
{
	// CODE TO GO HERE
}




/**
 * Function that is called when a get event is recieved by the server. It first checks 
 * that the server is in initialised state. If it is initialised it checks 
 * that the type of get matches the list of possible items (map,pos,game,graph). If
 * it finds a match, it creates an object of the information and emits it with a
 * 'get' event
 * @param {Client} client The client object that made the request
 * @param {string_list} request_parts The request line split by comma
 * @fires ServerState#get
 */
ServerState.prototype.getCall = function(client, request_parts)
{
	// check that the request is valid
	if(this.state != this.INITIALISED) 
	{
		client.write('0,0,Game is not in the initialised state\n');
		return;
	}


	// check that the type of thing being requested is ok
	var possible_gets = ['map','pos','game','graph'];
	var request_item = request_parts[1];
	for(var i = 0; i < possible_gets.length; i++)
	{
		if(request_item == possible_gets[i]) 
		{
			// build the arguments object
			var args = {}
			args.request = request_parts[0];
			args.item = request_parts[1];
			args.session_id = this.session_id;
			args.files_id = this.files_id;


			/**
			 * Get event. This event is fired when a valid get request has been
			 * passed to the server
			 * @event ServerState#get
			 * @type {function}
			 * @param {Client} client The client object that made the request
			 * @param {object} args The information needed to process the get request
			 */
			this.emit('get_file',client, args);
			return;
		}	
	}

	// if its not found call and error event
	sendInvalid(client, -1,'Get Item is Not one of: ' + possible_gets);
	return;

}



/**
 * Function to process an 'initialise' request from the client. Its first action
 * is to check that the state is idle. If so it checks that the request 
 * is in a valid format. If the format is ok, the request is split up and 
 * put into an object that is emited with the 'initialise' event
 * @param {Client} client The client object that made the request
 * @param {string_list} request_parts The request line split by comma
 * @fires ServerState#initialise
 */
ServerState.prototype.initialiseCall = function(client, request_parts)
{
	if(this.state != this.IDLE)
	{
		client.write("1,0,Game Not Idle\n");
		return;
	}
	
	// the state is correct for the request, check the arguments are ok
	if(request_parts.length < 4) 
	{
		this.sendInvalid(client, REQUEST_INITIALISE_IS_INCOMPLETE,
				"Request Incomplete. Expecting [intialise,num_players,session_name,files_id]");
		return;
	}

	var args = {};
	args.request = request_parts[0];
	args.num_players = parseInt(request_parts[1]);
	args.session_name = request_parts[2];
	args.files_id = parseInt(request_parts[3]);

	// we are now ok to emit the initialise event
	/**
	 * Initialised event. This event is fired when a valid initialise request has been
	 * passed to the server
	 * @event ServerState#initialise
	 * @type {function}
	 * @param {Client} client The client object that made the request
	 * @param {object} args The information needed to process the initialise request
	 */
	this.emit('initialise', client, args);
	return;
}

/**
 * Function that processes invalid requests. If an invalid request is 
 * detected this function will emit the 'invalid_request' event and pass with it 
 * information about the error
 * @param {Client} client The client object that made the request
 * @param {int} code An error code
 * @param {string} reason The reason for the error
 * @files ServerState#invalid_request
 */
ServerState.prototype.sendInvalid = function(client, code, reason)
{
	var err = {'message': reason, 'code' : code}
	/**
	 * Event that is triggered by an invalid request
	 * @event ServerState#invalid_request
	 * @type{function}
	 * @param {Client} client The client object that made the request
	 * @param {object} err An error object containing the error code and the reason
	 */
	this.emit('invalid_request', client, err);
}



ServerState.prototype.setSessionId = function(id)
{
	this.session_id = id;
}

ServerState.prototype.setFilesId = function(id)
{
	this.files_id = id;
}

ServerState.prototype.getSessionId = function(id)
{
	return this.session_id;
}

ServerState.prototype.getFilesId = function(id)
{
	return this.files_id;
}

/**
 * Function to set the state of the server. 
 * @param {int} state The state that you wish the server to
 * have
 */
ServerState.prototype.setState = function(state)
{
	this.state = state;
}


module.exports = ServerState;

