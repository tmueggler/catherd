import http = require('http');
import {Server} from "http";
import Express = require('express');
import io = require('socket.io');

let rest: Express.Express = Express();
let server: Server = http.createServer(rest);
let socketio: SocketIO.Server = io(server);

socketio.on('connection', function (con) {
    console.log(`SocketIO 'connection' ${con}`);
});

const serverPort = 3000;

server.listen(serverPort, function () {
    console.info(`Backend listening @${serverPort}`);
});