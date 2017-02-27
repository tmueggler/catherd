import * as fs from "fs";
import uuid = require("uuid");

export class GatewayConfigProvider {
    private cached: GatewayConfig;

    constructor(private readonly path: string) {
    }

    get(): GatewayConfig {
        if (this.cached != null) {
            return this.cached;
        }
        let save: boolean = false;
        let cfg: GatewayConfig = null;
        if (!fs.existsSync(this.path)) {
            cfg = {uuid: null, backendUrl: null};
            save = true;
        } else {
            cfg = JSON.parse(fs.readFileSync(this.path, {encoding: 'UTF-8'}));
        }
        if (!cfg.uuid) {
            cfg.uuid = uuid.v4();
            save = true;
        }
        if (save) {
            fs.writeFileSync(this.path, JSON.stringify(cfg));
        }
        this.cached = cfg;
        return this.cached;
    }
}

export class GatewayConfig {
    uuid: string;
    backendUrl: string;
}