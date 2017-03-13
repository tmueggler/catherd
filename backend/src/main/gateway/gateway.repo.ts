import {Gateway} from "@catherd/api/node";

export class GatewayRepo {
    private readonly infos: Map<string, Gateway.Info>;

    constructor() {
        this.infos = new Map();
    }

    all(): Gateway.Info[] {
        return [];
    }

    update(data: Gateway.Info) {
        this.infos.set(data.uuid, data);
    }
}