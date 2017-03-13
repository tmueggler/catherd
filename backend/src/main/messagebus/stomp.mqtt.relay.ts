import {Connection} from "sockjs";
import {MessageBus} from "./messagebus.service";
import * as Mqtt from "mqtt";
import {MessagingCfg} from "./messagebus.config";
import {LoggerFactory} from "@catherd/logcat/node";

let log = LoggerFactory.get('stomp-mqtt-relay');

export class StompMqttRelay implements MessageBus.ConnectionHandler {
    private readonly connections: Map<string, Relay>;

    constructor(private readonly cfg: MessagingCfg.ServerCfg.StompCfg) {
        this.connections = new Map();
    }

    handle(con: Connection): void {
        let relay: Relay = this.connections.get(con.id);
        if (!relay) {
            try {
                let mqtt = Mqtt.connect(this.cfg.broker_url);
                relay = new Relay(con, mqtt);
                this.connections.set(con.id, relay);
            } catch (error) {
                log.warn(`Problem initializing relay. Reason ${error}`);
                con.close('4502', 'Bad Gateway');
            }
        }
    }
}

class Relay {
    constructor(private readonly stomp: Connection, private readonly mqtt: Mqtt.Client) {
        stomp.on('data', (data: string) => this.stompIn(data));
        stomp.on('error', (error: any) => this.stompError(error));
        stomp.on('close', () => this.stompClose());

        mqtt.on('connect', (ack: any) => this.mqttConnect(ack));
        mqtt.on('reconnect', () => this.mqttReconnect());
        mqtt.on('message', (topic: string, message: string) => this.mqttIn(topic, message));
        mqtt.on('error', (error: Error) => this.mqttError(error));
        mqtt.on('offline', () => this.mqttOffline());
        mqtt.on('close', (error: Error) => this.mqttClose(error));
    }

    private stompIn(data: string): void {
        log.debug(`Stomp message ${data}`);
        // TODO parse stomp message
        // TODO forward to mqtt
    }

    private stompError(error: any): void {
        log.warn(`Stomp error ${error}`);
        // TODO
    }

    private stompClose(): void {
        log.warn(`Stomp close`);
        // TODO
    }

    private mqttConnect(ack: Mqtt.Packet): void {
        log.debug(`Mqtt connect ${ack.messageId}`);
    }

    private mqttReconnect(): void {
        log.debug(`Mqtt reconnect`);
    }

    private mqttIn(topic: string, message: string): void {
        log.debug(`Mqtt message ${message} -> ${topic}`);
        // TODO convert to stomp message
        // TODO forward stomp message
    }

    private mqttOffline() {
        log.warn(`Mqtt offline`);
    }

    private mqttClose(error: Error): void {
        if (error) {
            log.warn(`Mqtt connection closed with error ${error}`);
        } else {
            log.warn(`Mqtt connection closed`);
        }
        // TODO
    }

    private mqttError(error: Error): void {
        log.warn(`Mqtt error ${error.message}`);
        // TODO
    }
}