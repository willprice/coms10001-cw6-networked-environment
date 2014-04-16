// player.js
// ---------

function Player(id, location_id, type, tickets)
{
	this.id = id;
	this.location_id = location_id;
	this.type = type;
	this.tickets = tickets;
	this.move_list = [location_id];
}

Player.prototype.printTickets = function()
{
	console.log(this.tickets);
};

Player.prototype.useTicket = function(ticket)
{
	//console.log(this.tickets);
	this.tickets[ticket]--;
	//console.log(this.tickets);
};


Player.prototype.addTicket = function(ticket)
{
	this.tickets[ticket]++;
};

Player.prototype.getTicketNumber = function(ticket)
{
	return this.tickets[ticket];
};

Player.prototype.moveTo = function(target, ticket)
{
	var move = {};
	move.id = target;
	move.ticket = ticket;
	this.move_list.push(move);
	this.location_id = target;
};

Player.prototype.hasTickets = function(ticket)
{
	if(this.tickets[ticket] > 0) return true;
	return false;
};


Player.prototype.moveToSecret = function(target)
{
	this.moveTo(target, "SecretMove");
};

module.exports = Player;
