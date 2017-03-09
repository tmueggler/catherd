import http = require('http');
import {Server} from "http";
import * as r from "rethinkdb";
import {DbService} from "./db/db.service";
import {RegistrationService} from "./registration/registration.service";
import * as dbcfg from "./db/db.config";
import {GatewayService} from "./gateway/gateway.service";
import {MessageBus} from "./messagebus/messagebus.service";
import {Create as CreateMessageTransceiver, MessageReceiver} from "./messagebus/message.receiver";
import {MessagingCfg} from "./messagebus/messagebus.config";
import {Create as CreateRestServer, RestServer} from "./rest/rest.server";
import {DefaultBeanFactory, DefaultContext} from "@catherd/inject/node";
import {ServerBeans} from "./server.beans";
import {GatewayRepo} from "./gateway/gateway.repo";

let $$factores = new DefaultBeanFactory();

$$factores.define({
    name: ServerBeans.SERVER,
    create: () => {
        return http.createServer();
    }
});

$$factores.define({
    name: ServerBeans.REST_SERVER,
    create: (name, ctx) => {
        return CreateRestServer(name, ctx);
    }
});

const DB: r.ConnectionOptions = {
    host: dbcfg.HOST,
    port: dbcfg.PORT
};

$$factores.define({
    name: ServerBeans.DB_SERVICE,
    create: () => {
        return new DbService(DB);
    }
});

$$factores.define({
    name: ServerBeans.REGISTRATION_SERVICE,
    create: (name, ctx) => {
        return new RegistrationService(ctx.get<DbService>(ServerBeans.DB_SERVICE));
    }
});

$$factores.define({
    name: ServerBeans.GATEWAY_SERVICE,
    create: (name, ctx) => {
        return new GatewayService(ctx.get<DbService>(ServerBeans.DB_SERVICE));
    }
});

$$factores.define({
    name: ServerBeans.GATEWAY_REPO,
    create: () => {
        return new GatewayRepo();
    }
});

$$factores.define({
    name: ServerBeans.MESSAGE_TRANSCEIVER,
    create: (name, ctx) => {
        return CreateMessageTransceiver(name, ctx);
    }
});

let $ctx = DefaultContext.initialize($$factores);

const serverPort = 3000;
let $server = $ctx.get<Server>(ServerBeans.SERVER);

let $db = $ctx.get<DbService>(ServerBeans.DB_SERVICE);
$db.start();

let $rest = $ctx.get<RestServer>(ServerBeans.REST_SERVER);
$rest.start($server);

let $messagetx = $ctx.get<MessageReceiver>(ServerBeans.MESSAGE_TRANSCEIVER);
$messagetx.start();

let $messagebbus = new MessageBus(MessagingCfg.SERVER);
$messagebbus.start($server);

$server.listen(serverPort, function () {
    console.info(`Backend listening @${serverPort}`);
});