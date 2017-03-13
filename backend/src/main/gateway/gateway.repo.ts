import {Gateway} from "@catherd/api/node";

export class GatewayRepo {
    private readonly infos: Map<string, Gateway.Info>;

    constructor() {
        this.infos = new Map();
    }

    all(): Gateway.Info[] {
        let res: Gateway.Info[] = [];
        for (let g of this.infos.values()) {
            res.push(g);
        }
        return res;
    }

    update(data: Gateway.Info) {
        this.infos.set(data.uuid, data);
    }
}