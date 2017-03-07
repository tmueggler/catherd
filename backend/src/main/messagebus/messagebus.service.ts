import {Server as HttpServer} from "http";
import {createServer, Connection} from "sockjs";
import {MessageBroker} from "./message.broker";
import {StompMqttRelay} from "./stomp.mqtt.relay";
import {MqttRelay} from "./mqtt.realy";

export class MessageBus {
    private running: boolean;
    private broker: MessageBus.ConnectionHandler;
    private stompRelay: MessageBus.ConnectionHandler;
    private mqttRelay: MessageBus.ConnectionHandler;

    constructor() {
        this.running = false;
        this.broker = new MessageBroker();
        this.stompRelay = new StompMqttRelay();
        this.mqttRelay = new MqttRelay();
    }

    start(http: HttpServer) {
        if (this.running) {
            return;
        }

        let sockjs = createServer();
        sockjs.on('connection', (con) => this.broker.handle(con));
        sockjs.installHandlers(http, {prefix: '/messagebus'});

        let stomp = createServer();
        stomp.on('connection', (con) => this.stompRelay.handle(con));
        stomp.installHandlers(http, {prefix: '/messagebus/stomp'});

        let mqtt = createServer();
        mqtt.on('connection', (con) => this.mqttRelay.handle(con));
        mqtt.installHandlers(http, {prefix: '/messagebus/mqtt'});

        this.running = true;
    }

    stop() {
        if (!this.running) {
            return;
        }
    }
}

export namespace MessageBus {
    export interface ConnectionHandler {
        handle(con: Connection): void;
    }
}