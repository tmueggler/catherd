import http = require('http');
import {Server} from "http";
import * as r from "rethinkdb";
import {DbService} from "./db.service";
import {RegistrationService} from "./registration.service";
import * as dbcfg from "./db.config";
import {GatewayService} from "./gateway.service";
import * as sockjs from "sockjs";
import {Server as SockJSServer, Connection as SockJSConnection} from "sockjs";
import Express = require('express');

const serverPort = 3000;
const DB: r.ConnectionOptions = {
    host: dbcfg.HOST,
    port: dbcfg.PORT
};

let rest: Express.Express = Express();
let server: Server = http.createServer(rest);

let $db = new DbService(DB).start();
let $registrations = new RegistrationService($db);
let $gateway = new GatewayService($db);

rest.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

rest.get('/gateway/:uuid', function (req, res, next) {
    let uuid = req.params['uuid'];
    if (uuid == 'all') {
        $gateway.all()
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                console.log(`Problem retrieving all gateways. Reason ${err}`);
                res.sendStatus(500);
            })
    } else {
        $gateway.get(uuid)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                res.sendStatus(500);
            })
    }
});

rest.post('/register/:uuid', function (req, res, next) {
    let uuid = req.params['uuid'];
    $registrations.register(uuid)
        .then((result) => {
            console.log(`Registered ${uuid}`);
            res.sendStatus(200);
        })
        .catch((err) => {
            console.log(`Problem registering ${uuid}. Reason ${err}`);
            res.sendStatus(500);
        });
});

rest.post('/deregister/:uuid', function (req, res, next) {
    let uuid = req.params['uuid'];
    $registrations.deregister(uuid)
        .then((result) => {
            console.log(`Deregistered ${uuid}`);
            res.sendStatus(200);
        })
        .catch((err) => {
            console.log(`Problem deregistering ${uuid}. Reason ${err}`);
            res.sendStatus(500);
        });
});

let sockjsServer: SockJSServer = sockjs.createServer();
sockjsServer.on('connection', (con: SockJSConnection) => {
    console.log(`Connection from ${con.remoteAddress}:${con.remotePort}`);
    con.on('data', (message: any) => {
        console.log(`Message from ${con.remoteAddress}:${con.remotePort} ${message}`);
    });
    con.on('close', () => {
        console.log(`Connection close ${con.remoteAddress}:${con.remotePort}`);
    });
});
sockjsServer.installHandlers(server, {prefix: '/eventbus'});


server.listen(serverPort, function () {
    console.info(`Backend listening @${serverPort}`);
});