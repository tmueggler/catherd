import {Logger} from "./logger";
import {WinstonLogger} from "./logger.winston";

export class LoggerFactory {
    private static instances: Map<string, Logger> = new Map();

    static get(name: string): Logger {
        let instance = this.instances.get(name);
        if (!instance) {
            instance = new WinstonLogger(name);
            // TODO config
            this.instances.set(name, instance);
        }
        return instance;
    }
}