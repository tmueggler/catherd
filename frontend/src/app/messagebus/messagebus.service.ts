import {Injectable} from "@angular/core";
import {Configuration} from "../app.config";
import {Message} from "@catherd/api/web";
import {SockJSConnection} from "./messagebus.sockjs";
import {StompConnection} from "./messagebus.stomp";
import {MqttConnection} from "./messagebus.mqtt";

namespace ConnectionType {
    export const SOCKJS: number = 1;
    export const STOMP: number = 2;
    export const MQTT: number = 3;
}

@Injectable()
export class MessageBus {
    private readonly url: string;
    private connection: Connection;

    constructor(private cfg: Configuration.AppCfg) {
        this.url = cfg.messagebus.url;
    }

    start() {
        if (this.connection) {
            return;
        }
        switch (ConnectionType.MQTT) {
            case ConnectionType.SOCKJS:
                this.connection = new SockJSConnection(`${this.url}`);
                break;
            case ConnectionType.STOMP:
                this.connection = new StompConnection(`${this.url}/stomp`);
                break;
            case ConnectionType.MQTT:
                this.connection = new MqttConnection(`ws://192.168.56.104`);
                break;
            default:
                break;
        }
        this.connection.connect();
    }

    subscribe(topic: Topic, callback: OnMessage): Subscription {
        if (!this.connection) throw new Error(`No connection`);
        return this.connection.subscribe(topic, callback);
    }

    send(topic: Topic, msg: Message) {
        if (!this.connection) throw new Error(`No connection`);
        this.connection.send(topic, msg);
    }

    stop() {
        if (!this.connection) {
            return;
        }
        this.connection.close();
    }
}

export type Topic = string;

export interface Subscription {
    unsubscribe(): void;
}

export interface Connection {
    connect(): void;
    send(topic: Topic, message: Message): void;
    subscribe(topic: Topic, callback: OnMessage): Subscription;
    close(): void;
}

export interface OnMessage {
    (topic: Topic, msg: Message): void;
}