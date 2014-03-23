"use strict";
// ---------------------------------------------------------------------------------
// game_state_init.js
//
// Set of functions that load up the state of the game as empty
// ---------------------------------------------------------------------------------
var path = require('path');
var Graph = require('./graph');
var Player = require('./player');
var db_access = require('./db_access');

var RESOURCES_FOLDER = "resources";
var GRAPH_FILENAME   = path.join(RESOURCES_FOLDER, "graph.txt");
var DETECTIVE_TICKETS = {'Taxi': 11, 'Bus':8, 'Underground':4, 'DoubleMove': 0, 'SecretMove': 0};
var MRX_TICKETS = {'Taxi': 0, 'Bus': 0, 'Underground': 0, 'DoubleMove': 2, 'SecretMove': 5};
var AVAILABLE_TICKETS =  {'Taxi': 57, 'Bus': 45, 'Underground': 23, 'DoubleMove': 2, 'SecretMove': 5};

var DETECTIVE_STARTS = [13,123,138,141,155,174,29,26,34,50,53,91,94,103,112,117];
var MRX_STARTS = [35,45,51,71,78,104,106,132,127,146,166,170,172];



// function that builds a set of player objects first by entring them 
//  into the database to get their ids and then creating objects
function createPlayers(num_detectives, session_id, call)
{

	console.log("[Message]: Creating Players");

	var used_starting_locations = [];
	var used_tickets = {};
	used_tickets['Taxi'] = AVAILABLE_TICKETS['Taxi'];
	used_tickets['Bus'] = AVAILABLE_TICKETS['Bus'];
	used_tickets['Underground'] = AVAILABLE_TICKETS['Underground'];
	used_tickets['DoubleMove'] = AVAILABLE_TICKETS['DoubleMove'];
	used_tickets['SecretMove'] = AVAILABLE_TICKETS['SecretMove'];

	var players = [];


	// main loop for generating detectives
	for(var i = 0; i < num_detectives; i++)
	{
		generate_player(function(err, np){
			if(err) throw err;
			players.push(np);
			if(players.length == num_detectives)
			{
				finalise();
			}
		});
	}

	// function that generates a player
	function generate_player(cb)
	{
		var loc = get_start_location(DETECTIVE_STARTS);
		var tickets = {};
		tickets['Taxi'] = DETECTIVE_TICKETS['Taxi'];
		tickets['Bus'] = DETECTIVE_TICKETS['Bus'];
		tickets['Underground'] = DETECTIVE_TICKETS['Underground'];
		tickets['DoubleMove'] = DETECTIVE_TICKETS['DoubleMove'];
		tickets['SecretMove'] = DETECTIVE_TICKETS['SecretMove'];

		// update the used tickets
		used_tickets['Taxi'] -= DETECTIVE_TICKETS['Taxi'];
		used_tickets['Bus'] -= DETECTIVE_TICKETS['Bus'];
		used_tickets['Underground'] -= DETECTIVE_TICKETS['Underground'];
		var type = "D";

		// do the db query
		db_access.addPlayer(session_id, type, loc, tickets, function(err, data) {
			if(err) throw err;
			var id = data;
			var np = new Player(id, loc, type, tickets);
			cb(null, np);
		});
	}

	// function to finalise the player creation and return
	function finalise()
	{
		// generate mrx and return
		var xtype = "X";

		var xtickets = MRX_TICKETS;
		xtickets['Taxi'] = used_tickets['Taxi'];
		xtickets['Bus'] = used_tickets['Bus'];
		xtickets['Underground'] = used_tickets['Underground'];

		var xloc = get_start_location(MRX_STARTS);
		db_access.addPlayer(session_id, xtype, xloc, xtickets, function(err,data) {
			if(err) throw err;
			var id = data;
			var mx = new Player(id, xloc , xtype, xtickets);
			players.push(mx);
			call(null, players);
		});
	}

	

	// ----------------------------------------------------
	// Syncronous helpers
	// ----------------------------------------------------


	// function to get a random start location given a list
	function get_start_location(locations)
	{
		var max = locations.length;
		var good_index = false;
		var index = 0;
		while(!good_index)
		{
			index = Math.floor((Math.random()*max));
			if(!location_in_use(index, locations))
			{
				good_index = true;
			}
		}
		used_starting_locations.push(locations[index]);
		return locations[index];
	}

	// function to check if a start location is already occupied
	function location_in_use(index, locations)
	{
		var good = true;
		for(var i = 0; i < used_starting_locations.length; i++)
		{
			if(locations[index] == used_starting_locations[i])
			{
				return true;
			}
		}
		return false;
	}
	

}

// function that loads the graph as a graph object from the graph.txt file
function buildGraph(data)
{
	console.log("[Message]: Building Graph");
		
	// read the data into a graph object
	var lines = data.split("\n");
	var num_nodes = parseInt(lines[0].split(" ")[0]);
	var num_edges = parseInt(lines[0].split(" ")[1]);

	// read out the nodes
	var nodes = [];
	for(var i = 1; i < num_nodes+1; i++)
	{
		var nodeid = parseInt(lines[i]);
		nodes[i-1] = nodeid;
	}

	//  read out the edges
	var edges= [];
	var ecount = 0;
	for(var i = num_nodes+1; i < num_edges+num_nodes+1; i++)
	{
		var parts = lines[i].split(" ");
		var edge = {}
		edge.id1 = parseInt(parts[0]);
		edge.id2 = parseInt(parts[1]);
		edge.dist = parseFloat(parts[2]);
		edge.type = parts[3];	
		edges[ecount] = edge;
		ecount++;
	}	

	// build the graph object
	var graph = new Graph(num_nodes, num_edges, nodes, edges);

	return graph;
}



// main function for initailising the state of the game
exports.initialiseGame = function(options, callback)
{

	var db_access = require('./db_access');
	db_access.addSession(options.session_name, 
			options.files_id, 
			insert_session_cb);

	// variables to hold the data going out
	var output = {};
	output.session_id = 0;
	output.graph = null;
	output.players = [];

	function insert_session_cb(err, sid)
	{
		if(err) { callback(err); return; }		

		output.session_id = sid;

		// load the graph from the db
		db_access.getFile(options.files_id, 'graph', load_graph_cb);
	}

	function load_graph_cb(err, data)
	{
		if(err) { callback(err); return; }		

		output.graph = buildGraph(data);
	

		// create the new players for the session
		createPlayers(options.num_players, 
				output.session_id,
			   	create_players_cb);
	}


	// data argument is the list of initialised players
	function create_players_cb(err, data)
	{
		if(err) { callback(err); return; }		
		
		output.players = data;
		callback(null, output);
	}
}




// function to get the whole game state for it to be streamed over the network
exports.getWholeGameState = function(session_id, callback)
{
	var output = "";

	db_access.getSession(session_id, function(err, data) {
		if(err) throw err;
		output += "session_id:" + data["session_id"] + "\n";
		output += "session_name:"+ data["name"] + "\n";
		output += "files_id:"+ data["files_id"] + "\n";

		getPlayerIds();
	});


	function getPlayerIds()
	{
		db_access.getPlayerIds(session_id, function(err, data) {
			if(err) throw err;

			var player_ids = [];
			for(var i = 0 ; i < data.length; i++)
			{
				player_ids.push(data[i]['player_id']);
			}
			getPlayerInfo(player_ids);
		});
	}

	function getPlayerInfo(player_ids)
	{
		// now we extract the actual player information
		var players_extracted = 0;
		var num_players = player_ids.length;

		var players = [];
		for(var i = 0; i < num_players; i++)
		{
			db_access.getPlayer(player_ids[i], function(err,data) {
				if(err) throw err;
				players.push(data);
				players_extracted++;

				// check to see if we have extracted all the info
				if(players_extracted == num_players)
				{
					players.sort(function(a,b) {
						return a['player_id']-b['player_id'];
					});

					processPlayerInfo(players);
					getMoves(player_ids);
				}
			});
		}
	}


	function processPlayerInfo(data)
	{
		for(var i = 0; i < data.length; i++)
		{
			var row = data[i];
			var info  = "";
			info += "player:";
			for(var prop in row)
			{
				info += "," + row[prop];
			}
			info = info.replace(":,",":");
			info += "\n";	
			output += info;		
		}
	}




	function getMoves(player_ids)
	{
		var num_players = player_ids.length;
		var player_moves_extracted = 0;
		for(var i = 0; i < player_ids.length; i++)
		{
			var moves_info = [];
			db_access.getMoves(player_ids[i], function(err,data) {
				if(err) throw err;

				var info = processMoveInfo(data);

				moves_info.push(info);
				player_moves_extracted++;
				if(player_moves_extracted == num_players)
				{
					for(var r in moves_info)
					{
						output += moves_info[r];
					}				
					callback(output);
				}
			});
		}		
	}

	function processMoveInfo(data)
	{
		var info = "";
		for(var i = 0; i < data.length; i++ )
		{
			var row = data[i];
			info += "move:";
			for(var prop in  row)
			{
				info +="," + row[prop];
			}
			info+="\n";
			info = info.replace(":,",":");
		}
		return info;
	}

}
