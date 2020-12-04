var state;
var config;
var visiblePanel;

var toUpdate = false;
var firstTimeSetup = true;

var bell = new Audio('gong.wav');
var webSocket = new WebSocket("ws://" + document.location.host + "/ws");

webSocket.onopen = function (event) {
    webSocket.send('{"msg":"config"}');
    webSocket.send('{"msg":"fetch"}');

    setInterval(() => {
        webSocket.send('{"msg":"fetch"}');
        webSocket.send(`{"msg":"config", "data":${toUpdate ? JSON.stringify(JSON.stringify(config)) : 'null'}}`);
        if (toUpdate) {
            toUpdate = false;
        }
    }, 100);

    // WS Health
    setInterval(() => {
        switch (webSocket.readyState) {
            case 0:
                $('#badge-system').text("Connecting");
                $('#badge-system').addClass("badge-danger");
                $('#badge-system').removeClass("badge-success");
                break;
            case 1:
                $('#badge-system').text("Connected");
                $('#badge-system').addClass("badge-success");
                $('#badge-system').removeClass("badge-danger");
                break;
            case 2:
            case 3:
                $('#badge-system').text("Disabled");
                $('#badge-system').addClass("badge-danger");
                $('#badge-system').removeClass("badge-success");
                break;
        }
    }, 500);
};

webSocket.onmessage = function (event) {
    message = JSON.parse(event.data);

    switch (message.message) {
        case "ok":
            if (message.data === "") {
                break;
            }
            state = JSON.parse(message.data);
            update();
            //console.log(state);
            break;
        case "config":
            config = JSON.parse(message.data);
            updateConfig();
            //console.log(config);
            break;
    }
}

function updateConfig() {
    if (firstTimeSetup) {
        // Add candidates to splash
        for (var i = 1; i <= config.candidate_amount; i++) {
            $('#list-candidate').append(`<label id="btn-candidate-${i}" class="btn btn-primary btn-sm" onclick='sendCommand("candidate", ${i}, "candidate")'><input id="btn-candidate-${i}-radio" type="radio" name="candidates"><a id="btn-candidate-${i}-name">${config.candidate_list[i]}</a></label>`);
        }
        firstTimeSetup = false;
    }
}

function update() {
    updateTime(state.timeLeft);

    $('#badge-time').text(state.timeLeft + "s");
    $('#badge-ip').text(document.location.host);
    $('#badge-connections').text(state.connections);

    $('#badge-setup-file').text(config.file_name);
    $('#badge-setup-candidates').text(config.candidate_amount);
    $('#badge-setup-version').text(config.file_version);
    $('#badge-setup-timestamp').text(config.file_timestamp);

    // Speaker badge
    $('#badge-speaker').text(state.speaker);
    switch (state.speaker) {
        case "":
            $('#badge-speaker').text("[None]");
            $('#badge-speaker').addClass("badge-secondary");
            $('#badge-speaker').removeClass("badge-success");
            $('#badge-speaker').removeClass("badge-primary");
            break;
        case state.customText:
            if (state.customText.lenght === 0) {
                $('#badge-speaker').text("[Empty]");
            }
            $('#badge-speaker').addClass("badge-success");
            $('#badge-speaker').removeClass("badge-secondary");
            $('#badge-speaker').removeClass("badge-primary");
            break;
        default:
            $('#badge-speaker').addClass("badge-primary");
            $('#badge-speaker').removeClass("badge-secondary");
            $('#badge-speaker').removeClass("badge-success");
            break;
    }

    // State badge
    switch (state.state) {
        case "idle":
            $('#badge-state').text("Idle");
            $('#badge-state').addClass("badge-warning");
            $('#badge-state').removeClass("badge-danger");
            $('#badge-state').removeClass("badge-success");
            break;
        case "countdown":
            $('#badge-state').text("Countdown");

            $('#badge-state').removeClass("badge-warning");
            if (state.isTimerActive) {
                $('#badge-state').addClass("badge-success");
                $('#badge-state').removeClass("badge-danger");
            } else {
                $('#badge-state').addClass("badge-danger");
                $('#badge-state').removeClass("badge-success");
            }

            break;
    }

    // Progressbar value calc
    $('#progress-bar-time').width(state.timeLeft / state.totalTime * $('#progress-bar').width());

    // Ring bell
    if (state.ringBell) {
        bell.play();
        sendCommand("bell-rcv", null);
    }

    // Props
    if (state.bell_mode === 0) {
        $("#badge-bell").text("Auto");
        $("#badge-bell").addClass("alert-success");
        $("#badge-bell").removeClass("alert-danger");
    } else {
        $("#badge-bell").text("Manual");
        $("#badge-bell").addClass("alert-danger");
        $("#badge-bell").removeClass("alert-success");
    }

}

function sendCommand(command, data, dataName = "data") {
    console.log(`{"msg":"${command}", "${dataName}":${data}}`);
    webSocket.send(`{"msg":"${command}", "${dataName}":${data}}`);
}

function changeTotalTime() {
    sendCommand("totaltime", $('#text-totaltime').val(), "time");
}

function updateTime(time) {
    $('#text-time').text(convertTime(state.timeLeft));
}

function convertTime(time) {
    return String(Math.floor(time / 60)).padStart(2, 0) + ":" + String(time % 60).padStart(2, 0);
}

window.onload = () => {
    $('#date').text("25 Listopada 2019");
}

$('#text-custom').focusout(() => {
    var text = $('#text-custom').val();
    if (text === null) {
        text = " ";
    }
    sendCommand('customtext', `"${$('#text-custom').val()}"`, 'text');
    //sendCommand("candidate", 0, "candidate");
});