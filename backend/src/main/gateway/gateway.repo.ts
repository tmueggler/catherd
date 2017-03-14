import {Gateway} from "@catherd/api/node";
import {TemporalValue, DefaultTemporalValue} from "./temporal.value";
import {GatewayPersistedRepo, GatewayPersisted} from "./gateway.persisted.repo";
import * as Q from "q";


export class GatewayRepo {
    private readonly shadows: Map<string, GatewayShadow>;

    constructor(private readonly persisted: GatewayPersistedRepo) {
        this.shadows = new Map();
    }

    get(uuid: string): Promise<Gateway.Info> {
        let d = Q.defer();
        let shadow = this.shadows.get(uuid);
        if (shadow) {
            d.resolve()
        } else {
            this.persisted.get(uuid)
                .then((res) => {
                    d.resolve(res);
                })
                .catch((error) => {
                    d.reject(error);
                })
        }
        return <any>d.promise;
    }

    unauthorized(): Promise<Gateway.Info[]> {
        return this.all((d) => !d.authorized.value);
    }

    authorized(): Promise<Gateway.Info[]> {
        return this.all((d) => d.authorized.value);
    }

    private all(accept: (d: GatewayShadow | GatewayPersisted) => boolean): Promise<Gateway.Info[]> {
        let d = Q.defer();
        this.persisted.all()
            .then((persisted) => {
                let accepted: Gateway.Info[] = [];
                for (let pers of persisted) {
                    if (this.shadows.has(pers.uuid.value)) {
                        continue;
                    } else if (!accept(pers)) {
                        continue;
                    }
                    accepted.push({
                        uuid: pers.uuid.value,
                        version: pers.version.value,
                        state: Gateway.State.OFFLINE
                    });
                }
                for (let shadow of this.shadows.values()) {
                    if (!accept(shadow)) {
                        continue;
                    }
                    accepted.push({
                        uuid: shadow.uuid.value,
                        version: shadow.version.value,
                        state: shadow.state.value
                    });
                }
                d.resolve(accepted);
            })
            .catch((error) => {
                d.reject(error);
            });
        return <any>d.promise;
    }

    update(data: Gateway.Info): Promise<any> {
        let d = Q.defer();
        let shadow = this.shadows.get(data.uuid);
        if (shadow) {
            shadow.version.value = data.version;
            shadow.state.value = data.state;
            d.resolve();
        } else {
            this.persisted.get(data.uuid)
                .then((pers) => {
                        let shadow: GatewayShadow = {
                            uuid: pers ? pers.uuid : new DefaultTemporalValue(data.uuid),
                            version: new DefaultTemporalValue(data.version),
                            state: new DefaultTemporalValue(data.state),
                            authorized: pers ? pers.authorized : new DefaultTemporalValue(false),
                            _persisted: pers
                        };
                        this.shadows.set(data.uuid, shadow);
                    }
                )
                .catch((error) => {
                    d.reject(error);
                });
        }
        return <any>d.promise;
    }

    authorize(uuid: string): Promise<any> {
        let d = Q.defer();
        let shadow = this.shadows.get(uuid);
        if (shadow) {
            if (shadow.authorized.value) {
                d.resolve();
            } else {
                shadow.authorized.value = true;
                if (!shadow._persisted) {
                    let pers: GatewayPersisted = {
                        id: shadow.uuid.value,
                        uuid: shadow.uuid,
                        version: shadow.version,
                        authorized: shadow.authorized
                    };
                    this.persisted.create(pers)
                        .then((result) => {
                            shadow._persisted = pers;
                            d.resolve();
                        })
                        .catch((error) => {
                            shadow.authorized.value = false; // TODO modified timesamp affected !
                            d.reject(error);
                        });
                } else {
                    shadow._persisted.authorized.value = true;
                    this.persisted.update(shadow._persisted)
                        .then((result) => {
                            d.resolve();
                        })
                        .catch((error) => {
                            shadow.authorized.value = false; // TODO modified timestamp affected !
                            shadow._persisted.authorized.value = false; // TODO modified timesamp affected !
                            d.reject(error);
                        });
                }
            }
        } else { // Shadow does not exist
            this.persisted.get(uuid)
                .then((pers) => {
                    pers.authorized.value = true;
                    this.persisted.update(pers)
                        .then((result) => {
                            d.resolve();
                        })
                        .catch((error) => {
                            d.reject(error);
                        });
                })
                .catch((error) => {
                    d.reject(error);
                })
        }
        return <any>d.promise;
    }

    delete(uuid: string): Promise<any> {
        this.shadows.delete(uuid);
        return this.persisted.delete(uuid);
    }
}

interface GatewayShadow {
    readonly uuid: TemporalValue<string>;
    readonly version: TemporalValue<string>;
    readonly state: TemporalValue<Gateway.State>;
    readonly authorized: TemporalValue<boolean>;
    _persisted: GatewayPersisted;
}