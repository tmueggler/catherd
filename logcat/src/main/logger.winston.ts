import * as winston from "winston";
import {Logger} from "./logger";

export class WinstonLogger implements Logger {
    private delegate: winston.LoggerInstance;

    constructor(public readonly name: string) {
        this.delegate = new winston.Logger();
        this.delegate.level = 'debug';
        this.delegate.on('error', (error: any) => console.warn(`Logger ${this.name} error ${error}`));
    }

    error(msg: string): void {
        this.delegate.error(msg);
    }

    warn(msg: string): void {
        this.delegate.warn(msg);
    }

    info(msg: string): void {
        this.delegate.info(msg);
    }

    debug(msg: string): void {
        this.delegate.debug(msg);
    }
}