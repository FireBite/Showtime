const WebSocket = require('ws');

//const ws = new WebSocket('ws://10.0.10.11/ws');
const ws = new WebSocket('ws://192.168.1.240/ws');

ws.on('open', function open() {
  setInterval(() => {
    ws.send('{"msg":"fetch"}');
  }, 1000);
  
  ws.send('{"msg":"state", "state":"idle"}');
  
  /*
  setInterval(() => {
    ws.send('{"msg":"modify", "amount":2}');
  }, 5000);
  */
});

ws.on('message', function incoming(data) {
  console.log(data);
});