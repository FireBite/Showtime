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

    setTimeout(displayCandidates, 300);
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
        case "config":
            config = JSON.parse(message.data);
            updateConfig();
            //console.log(config);
            break;
    }
}

function updateConfig() {
    // Add candidates to splash
    console.log(config);

    candidateList = [];
    for (var i = 1; i <= config.candidate_amount; i++) {
        candidateList.push(`<div id="candidate-${i}" class="candidate d-flex flex-column align-items-center"> <div class="candidate-img"><img id="candidate-img" src="./img/${i}.jpg"></div> <div class = "candidate-desc">${config.candidate_list[i]}</div> </div>`);
    }

    displayOffset = 0;
}

function update() {
    if (state.state !== visiblePanel) {
        if (state.state === "idle") {
            $('#countdown').addClass("hide");
            $('#splash').removeClass("hide");
        } else {
            $('#countdown').removeClass("hide");
            $('#splash').addClass("hide");
        }

        visiblePanel = state.state;
    }

    updateTime(state.timeLeft);
    $('#candidate-name').text(state.speaker);

    if (state.speaker === "") {
        $('#candidate-name').addClass("m-0");
    } else {
        $('#candidate-name').removeClass("m-0");
    }
}

function displayCandidates() {
    if (config.splash_rnd) {
        $('#candidate-container').fadeOut("300", () => {
            $('#candidate-container').empty();
            for (var i = 0; i < config.candidate_amount; i++) {
                $('#candidate-container').append(candidateList[(i + displayOffset) % 3]);
            }
            $('#candidate-container').fadeIn("300");

            // Random order
            if (config.splash_rnd) {
                var rand = Math.floor((Math.random() * 100) % 3);
                if (rand === displayOffset) {
                    displayOffset++;
                } else {
                    displayOffset = rand;
                }
            } else {
                displayOffset++;
            }
        });
        setTimeout(displayCandidates, config.splash_delay);
    }
    else {
        $('#candidate-container').empty();
        for (var i = 0; i < config.candidate_amount; i++) {
            $('#candidate-container').append(candidateList[(i + displayOffset) % 3]);
        }
        $('#candidate-container').fadeIn("300");
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

window.onload = () => {
    $('#date').text("4 Grudnia 2020");
}