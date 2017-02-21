import http = require('http');
import {Server} from "http";
import * as r from "rethinkdb";
import {DbService} from "./db.service";
import {RegistrationService} from "./registration.service";
import * as dbcfg from "./db.config";
import {GatewayService} from "./gateway.service";
import {EventBus} from "./eventbus/eventbus.service";
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
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
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

rest.delete('/gateway/:uuid', function (req, res, next) {
    let uuid = req.params['uuid'];
    $gateway.delete(uuid)
        .then((result) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.sendStatus(500);
        });
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

let eventbus = new EventBus();
eventbus.start(server);

server.listen(serverPort, function () {
    console.info(`Backend listening @${serverPort}`);
});