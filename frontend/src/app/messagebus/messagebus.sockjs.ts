import {Connection, Topic} from "./messagebus.service";
import * as SockJS from "sockjs-client";
import {Message} from "@catherd/api/web";

export class SockJSConnection implements Connection {
    private sock: WebSocket;

    connect(url: string): void {
        this.sock = <any>new SockJS(url);
        this.sock.onopen = (evt) => {
            console.log(`Open: ${evt}`);
        };
        this.sock.onmessage = (evt) => {
            console.log(`Message: ${evt}`);
        };
        this.sock.onerror = (evt) => {
            console.log(`Error: ${evt}`);
        };
        this.sock.onclose = (evt) => {
            console.log(`Close: ${evt}`);
        };
    }

    send(topic: string, message: Message): void {
        if (!this.sock) {
            throw new Error('Not connected');
        }
        // TODO topic
        this.sock.send(JSON.stringify(message));
    }

    subscribe(topic: Topic, callback: (msg: Message) => void) {
    }

    close(): void {
        if (this.sock) {
            this.sock.close();
        }
    }
}