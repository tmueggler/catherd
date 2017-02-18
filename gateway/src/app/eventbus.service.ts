import * as io from "socket.io-client";

export class EventBus {
    private socket: SocketIOClient.Socket;

    constructor(private url: string) {
    }

    start() {
        if (this.socket != null) {
            return;
        }
        this.socket = io.connect(this.url);
        this.socket.on('connect', (socket: SocketIOClient.Socket) => {
            console.log(`Connected to ${socket.io.uri}`);
        });
        this.socket.on('error', (err) => {
            console.warn(`Caught error ${err}`);
        });
        this.socket.on('disconnect', () => {
            console.log(`Disconnected from ${this.socket.io.uri}`);
        });
    }

    stop() {
        if (this.socket == null) {
            return;
        }
        this.socket.close();
        this.socket = null;
    }
}