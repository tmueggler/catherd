import {MessageBusConnection, Subscription} from "./messagebus.service";
import {Message} from "@catherd/api/node";
import * as Mqtt from "mqtt";
import {LoggerFactory} from "@catherd/logcat/node";

export class MqttConnection implements MessageBusConnection {
    private readonly log = LoggerFactory.get('mqtt-connection');

    constructor(private readonly url: string) {
    }

    reconnect_ms: number = 1000;

    private _connected: boolean;

    get connected(): boolean {
        return this._connected;
    }

    private client: Mqtt.Client;

    connect(): void {
        if (this.client) {
            return;
        }
        this.client = Mqtt.connect(this.url, {reconnectPeriod: this.reconnect_ms});
        this.client.on('connect', (ack: Mqtt.Packet) => this.mqttConnect());
        this.client.on('message', (topic: string, payload: string, packet: Mqtt.Packet) => this.mqttMessage(topic, payload, packet));
        this.client.on('close', () => this.mqttClose());
        this.client.on('error', (error: any) => this.mqttError(error));
        this.client.on('offline', () => this.mqttOffline());
        this.client.on('reconnect', () => this.mqttReconnect());
    }

    subscribe(topic: string): Subscription {
        if (!this.client) {
            throw new Error(`Not connected`);
        }
        this.client.subscribe(topic);
        return new MqttSubscription(this.client, topic);
    }

    send(topic: string, msg: Message): void {
        if (!this.client) {
            throw new Error(`Not connected`);
        }
        let str = JSON.stringify(msg);
        this.client.publish(topic, str);
    }

    disconnect(): void {
        if (this.client) {
            this.client.end();
            this.client = null;
        }
    }

    private mqttConnect(): void {
        this.log.debug(`Mqtt connect ${this.url}`);
        this._connected = true;
        this.fireConnected();
    }

    private mqttMessage(topic: string, payload: string, pkt: Mqtt.Packet): void {
        this.log.debug(`Mqtt message ${payload}`);
        let msg = JSON.parse(payload)
        this.fireMessage(topic, msg);
    }

    private mqttClose(): void {
        this._connected = false;
        this.log.debug(`Mqtt close`);
        this.fireDisconnected()
    }

    private mqttError(error: any): void {
        this.log.debug(`Mqtt error ${error}`);
        this.fireError(error);
    }

    private mqttOffline(): void {
        this._connected = false;
        this.log.debug(`Mqtt offline`)
    }

    private mqttReconnect(): void {
        this._connected = false;
        this.log.debug(`Mqtt reconnect`)
    }

    onconnected: (con: MessageBusConnection) => void;

    private fireConnected() {
        if (this.onconnected) {
            this.onconnected(this);
        }
    }

    onmessage: (con: MessageBusConnection, topic: string, msg: Message) => void;

    private fireMessage(topic: string, msg: Message): void {
        if (this.onmessage) {
            this.onmessage(this, topic, msg);
        }
    }

    ondisconnected: (con: MessageBusConnection) => void;

    private fireDisconnected() {
        if (this.ondisconnected) {
            this.ondisconnected(this);
        }
    }

    onerror: (con: MessageBusConnection, error: any) => void;

    private fireError(error: any): void {
        if (this.onerror) {
            this.onerror(this, error);
        }
    }
}

class MqttSubscription implements Subscription {
    constructor(private readonly client: Mqtt.Client, private readonly topic: string) {
    }

    unsubscribe(): void {
        this.client.unsubscribe(this.topic);
    }
}