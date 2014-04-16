"use safe";
var ServerState = require('../src/server_state');

var server_state = new ServerState;

var tests = {};
var emit_tests = {};


function assert_request_emits_event(test, request, event, state) {
    test.expect(1);

    server_state.on(event, function () {
        test.ok(true);
        test.done();
    });

    server_state.state = state;
    server_state.processRequest(null, request);
}

var emit_test_cases = [
    ["join", "join", server_state.INITIALISED],
    ["move", "move,1,1,Taxi", server_state.RUNNING],
    ["next_player", "next_player", server_state.RUNNING],
    ["game_over", "game_over", server_state.RUNNING],
    ["winning_player", "winning_player", server_state.GAME_OVER],
    ["reset", "reset", server_state.INITIALISED],
    ["initialise", "initialise,5,test_session,1", server_state.IDLE],
    ["get_file", "get_file,map", server_state.INITIALISED]
];

emit_test_cases.forEach(function(test_case) {
    var event = test_case[0];
    var request =  test_case[1];
    var state = test_case[2];

    emit_tests["test_" + event] = function(test) {
        assert_request_emits_event(test, request, event, state);
    };
});

tests.emit_tests = emit_tests;
module.exports = tests;