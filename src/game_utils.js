/**
 * @typedef {{Taxi: int, Bus: int, Underground: int, DoubleMove: int, SecretMove: int}} tickets
 */

var print = require('./output');

module.exports = {
    /**
     *
     * @param {int} player_id
     * @param {int} move_id
     * @param {int} start_location
     * @param {int} end_location
     * @param {string} ticket_type
     * @returns {{move_id: *, start_location: *, end_location: *, ticket_type: *, player_id: *}}
     */
    create_move: function (player_id, move_id, start_location, end_location, ticket_type) {
        return  {
            move_id: move_id,
            start_location: start_location,
            end_location: end_location,
            ticket_type: ticket_type,
            player_id: player_id
        };

    },

    create_tickets: function(taxi_tickets, bus_tickets, underground_tickets, double_move_tickets,
        secret_move_tickets) {
        return {
            Taxi: taxi_tickets,
            Bus: bus_tickets,
            Underground: underground_tickets,
            DoubleMove: double_move_tickets,
            SecretMove: secret_move_tickets
        };
    },

    /**
     * @param {int} session_id
     * @param {string} player_type
     * @param {int} player_location
     * @param {tickets} tickets
     * @returns {{session_id: *, player_type: *, player_location: *, tickets: *}}
     */
    create_player: function(player_id, session_id, player_type, player_location, tickets) {
        return {
            id: player_id,
            session_id: session_id,
            type: player_type,
            location: player_location,
            tickets: tickets
        };
    },

    create_player_from_row: function(player_row) {
        var tickets = module.exports.create_tickets(player_row.taxi_tickets, player_row.bus_tickets,
            player_row.underground_tickets, player_row.double_tickets, player_row.secret_tickets);

        var player =  module.exports.create_player(player_row.player_id, player_row.session_id, player_row.type,
        player_row.location, tickets);

        return player;
    },

	/**
	 * @param {int} id
	 * @param {string} name
	 * @param {int} files_id
	 * @returns {{session_id: *, session_name: *, files_id: *}} 
	 */
	create_session: function(id, name, files_id) {
		return {
			session_id: id,
			name: name,
			files_id: files_id
		};
	},

    print_session: function(session_db_row) {
        output
    }
};
