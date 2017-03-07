import {MessageBusConnection} from "./messagebus.service";
import {Message} from "@catherd/api/node";
import * as Mqtt from "mqtt";

export class MqttConnection implements MessageBusConnection {
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

    subscribe(topic: string): void {
        if (!this.client) {
            throw new Error(`Not connected`);
        }
        this.client.subscribe(topic);
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
        console.log(`Mqtt connect ${this.url}`);
        this._connected = true;
        this.fireConnected();
    }

    private mqttMessage(topic: string, payload: string, pkt: Mqtt.Packet): void {
        let msg = JSON.parse(payload)
        this.fireMessage(topic, msg);
    }

    private mqttClose(): void {
        this._connected = false;
        console.log(`Mqtt close`);
        this.fireDisconnected()
    }

    private mqttError(error: any): void {
        console.log(`Mqtt error ${error}`);
        this.fireError(error);
    }

    private mqttOffline(): void {
        this._connected = false;
        console.log(`Mqtt offline`)
    }

    private mqttReconnect(): void {
        this._connected = false;
        console.log(`Mqtt reconnect`)
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