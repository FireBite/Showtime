var state;
var config;
var visiblePanel;
var revision = 0;
var candidateList = [];
var displayOffset = 0;

var webSocket = new WebSocket("ws://" + document.location.host + "/ws");

webSocket.onopen = function (event) {
    webSocket.send('{"msg":"config"}');
    webSocket.send('{"msg":"fetch"}');

    setInterval(() => {
        webSocket.send('{"msg":"fetch"}');
    }, 100);
};

webSocket.onmessage = function (event) {
    message = JSON.parse(event.data);

    switch (message.message) {
        case "ok":
            state = JSON.parse(message.data);
            update();
            if (revision != state.revision) {
                webSocket.send('{"msg":"config"}');
                revision = state.revision;
            }
            //console.log(state);
            break;
    }
}

function update() {
    if (state.state === "idle") {
        $('#time').fadeOut(100);
        $('#speaker').fadeOut(100);
    } else {
        $('#time').fadeIn(100);
        $('#speaker').fadeIn(100);
        updateTime(state.timeLeft);
        $('#speaker').text(state.speaker);
    }
}

function updateTime(time) {
    $('#time').text(convertTime(state.timeLeft));

    if (time > 10) {
        $('#time').removeClass("text-danger");
    } else {
        if (time % 2 == 1) {
            $('#time').addClass("text-danger");
        } else {
            $('#time').removeClass("text-danger");
        }
    }
}

function convertTime(time) {
    return String(Math.floor(time / 60)).padStart(2, 0) + ":" + String(time % 60).padStart(2, 0);
}