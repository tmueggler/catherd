import {Server} from "http";
import * as Express from "express";
import {RequestHandler, Request, Response, NextFunction, Router} from "express";
import {GatewayService} from "../gateway/gateway.service";
import {BeanName, Context} from "@catherd/inject/node";
import {ServerBeans} from "../server.beans";

export interface RestServer {
    start(server: Server): void;

    stop(): void;
}

export function Create(name: BeanName, ctx: Context): RestServer {
    let app = Express();
    app.use(Cors);
    app.use('/gateway', GatewayApi(ctx));
    // TODO
    return new DefaultRestServer(app);
}

class DefaultRestServer implements RestServer {
    constructor(private readonly app: Express.Application) {
    }

    private server: Server;

    start(server: Server): void {
        if (this.server) {
            return;
        }
        this.server = server;
        this.server.addListener('request', this.app);
    }

    stop(): void {
        if (!this.server) {
            return;
        }
        this.server.removeListener('request', this.app);
        this.server = null;
    }
}

function Cors(req: Request, res: Response, next: NextFunction): void {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
    next();
}

function GatewayApi(ctx: Context): Router {
    let app = Express.Router();
    app.get('/all', GatewayApi.GetAll(null, ctx));
    app.get('/:uuid', GatewayApi.GetByUuid(null, ctx));
    app.delete('/:uuid', GatewayApi.Delete(null, ctx));
    return app;
}

namespace GatewayApi {
    export function GetAll(name: BeanName, ctx: Context): RequestHandler {
        let $gateway = ctx.get<GatewayService>(ServerBeans.GATEWAY_SERVICE);
        return function (req: Request, res: Response, next: NextFunction): void {
            let uuid = req.params['uuid'];
            $gateway.all()
                .then((result) => {
                    res.send(result);
                })
                .catch((err) => {
                    console.log(`Problem retrieving all gateways. Reason ${err}`);
                    res.sendStatus(500);
                })
        }
    }

    export function GetByUuid(name: BeanName, ctx: Context): RequestHandler {
        let $gateway = ctx.get<GatewayService>(ServerBeans.GATEWAY_SERVICE);
        return function (req: Request, res: Response, next: NextFunction): void {
            let uuid = req.params['uuid'];
            $gateway.get(uuid)
                .then((result) => {
                    res.send(result);
                })
                .catch((err) => {
                    res.sendStatus(500);
                })
        }
    }

    export function Delete(name: BeanName, ctx: Context): RequestHandler {
        let $gateway = ctx.get<GatewayService>(ServerBeans.GATEWAY_SERVICE);
        return function (req: Request, res: Response, next: NextFunction): void {
            let uuid = req.params['uuid'];
            $gateway.delete(uuid)
                .then((result) => {
                    res.sendStatus(200);
                })
                .catch((err) => {
                    res.sendStatus(500);
                });
        }
    }
}

