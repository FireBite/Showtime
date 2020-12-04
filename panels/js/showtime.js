var state;
var webSocket = new WebSocket("ws://" + document.location.host + "/ws");

webSocket.onopen = function (event) {
    webSocket.send('{"msg":"fetch"}');
};

webSocket.onmessage = function (event) {
    state = JSON.parse(event.data);

    update();

    console.log(state);
}

function update(){

}