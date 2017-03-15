import {Message} from "@catherd/api/node";
import {EventBus} from "../eventbus/eventbus.service";
import {MessageBusEvent} from "./messagebus.event";
import {SockJSConnection} from "./messagebus.sockjs.connection";
import {MqttConnection} from "./messagebus.mqtt.connection";

namespace ConnectionType {
    export const SOCKJS: number = 1;
    export const MQTT: number = 2;
}

export class MessageBus {
    private readonly connection: MessageBusConnection;
    private reconnect_ms = 5000;

    constructor(private readonly url: string, private readonly events: EventBus) {
        let con: MessageBusConnection;
        switch (ConnectionType.MQTT) {
            case ConnectionType.SOCKJS:
                con = new SockJSConnection(`${this.url}/messagebus`);
                break;
            case ConnectionType.MQTT:
                con = new MqttConnection(`mqtt://192.168.56.104:1883`);
                break;
            default:
                throw new Error();
        }
        con.onconnected = (con) => this.connectionConnected(con);
        con.onmessage = (con, topic, msg) => this.connectionMessage(con, topic, msg);
        con.ondisconnected = (con) => this.connectionDisconnected(con);
        con.reconnect_ms = this.reconnect_ms;
        this.connection = con;
    }

    private connectionConnected(con: MessageBusConnection): void {
        this.events.send({type: MessageBusEvent.CONNECTED, src_id: null});
    }

    private connectionMessage(con: MessageBusConnection, topic: string, msg: Message): void {
        this.fireMessage(topic, msg)
    }

    private connectionDisconnected(con: MessageBusConnection): void {
        this.events.send({type: MessageBusEvent.DISCONNECTED, src_id: null});
    }

    start(): void {
        if (!this.connection.connected) {
            this.connection.connect();
        }
    }

    subscribe(topic: string): Subscription {
        if (!this.connection.connected) throw new Error(`Not connected`);
        return this.connection.subscribe(topic);
    }

    send(topic: string, msg: Message): void {
        if (!this.connection.connected) throw new Error(`Not connected`);
        this.connection.send(topic, msg);
    }

    stop(): void {
        this.connection.disconnect();
    }

    onmessage: (topic: string, msg: Message) => void;

    private fireMessage(topic: string, msg: Message): void {
        if (this.onmessage) {
            this.onmessage(topic, msg);
        }
    }
}

export interface MessageBusConnection {
    reconnect_ms: number;
    readonly connected: boolean;
    connect(): void;
    subscribe(topic: string): Subscription;
    send(topic: string, msg: Message): void;
    disconnect(): void;
    onconnected: (src: MessageBusConnection) => void;
    onmessage: (src: MessageBusConnection, topic: string, msg: Message) => void;
    ondisconnected: (src: MessageBusConnection) => void;
    onerror: (src: MessageBusConnection, error: any) => void;
}

export interface Subscription {
    unsubscribe(): void;
}