const State = require("./state");
const CommandParser = require("./commandParser");

const fs = require('fs');
var ip = require('ip');
const http = require('http');
const WebSocket = require('ws');
var static = require('node-static');
const url = require('url');

// Load config

console.log("Loading config...");

try {
    var configName = 'config.json';
    var rawdata = fs.readFileSync(configName);
    var config = JSON.parse(rawdata);

    //console.log(config);

    //Fill file metadata
    var stats = fs.statSync(configName);
    var mtime = stats.mtime;

    config.file_name = configName;
    config.file_timestamp = mtime;


    //Network
    config.net_ip = ip.address()


    console.log("Config: " + configName + " V." + config.file_version);
} catch (e){
    console.error("Config invalid, aborting!");
    throw e;
}


//Start server

console.log("Starting server...");

state = new State(config);
parser = new CommandParser(state, config);
var file = new(static.Server)();

const server = http.createServer(function (req, res) {
    try {
        file.serve(req, res);
    } catch (e) {
        console.error("[Static] ServeException: " + e)
    }
});
const wss1 = new WebSocket.Server({
    noServer: true,
    clientTracking: true
});

//Events

wss1.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        ws.send(parser.parse(data));
    });
});

server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;

    if (pathname === '/ws') {
        wss1.handleUpgrade(request, socket, head, function done(ws) {
            wss1.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

setInterval(() => {
    state.connections = wss1.clients.size;
}, 1000);

console.dir("IP: " + config.net_ip);
console.log("Ready!");
server.listen(2137);