import {Server} from "http";
import * as Express from "express";
import {RequestHandler, Request, Response, NextFunction, Router} from "express";
import {BeanName, Context} from "@catherd/inject/node";
import {ServerBeans} from "../server.beans";
import {GatewayRepo} from "../gateway/gateway.repo";
import {LoggerFactory} from "@catherd/logcat/node";

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

const LOGGER_NAME = 'rest-server';

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
    app.get('/unauthorized', GatewayApi.GetUnauthorized(null, ctx));
    app.get('/authorized', GatewayApi.GetAuthorized(null, ctx));
    app.get('/:uuid', GatewayApi.GetByUuid(null, ctx));
    app.post('/authorize/:uuid', GatewayApi.Authorize(null, ctx));
    app.delete('/:uuid', GatewayApi.Delete(null, ctx));
    return app;
}

namespace GatewayApi {
    let log = LoggerFactory.get(LOGGER_NAME);

    export function GetUnauthorized(name: BeanName, ctx: Context): RequestHandler {
        let $gateways = ctx.get<GatewayRepo>(ServerBeans.GATEWAY_REPO);
        return function (req: Request, res: Response, next: NextFunction): void {
            $gateways.unauthorized()
                .then((result) => {
                    res.send(result);
                })
                .catch((error) => {
                    log.debug(`Problem retrieving all gateways. Reason ${error}`);
                    res.sendStatus(500);
                });
        }
    }

    export function GetAuthorized(name: BeanName, ctx: Context): RequestHandler {
        let $gateway = ctx.get<GatewayRepo>(ServerBeans.GATEWAY_REPO);
        return function (req: Request, res: Response, next: NextFunction): void {
            $gateway.authorized()
                .then((result) => {
                    res.send(result);
                })
                .catch((error) => {
                    log.debug(`Problem retrieving all gateways. Reason ${error}`);
                    res.sendStatus(500);
                })
        }
    }

    export function GetByUuid(name: BeanName, ctx: Context): RequestHandler {
        let $gateway = ctx.get<GatewayRepo>(ServerBeans.GATEWAY_REPO);
        return function (req: Request, res: Response, next: NextFunction): void {
            let uuid = req.params['uuid'];
            $gateway.get(uuid)
                .then((result) => {
                    res.send(result);
                })
                .catch((error) => {
                    log.debug(`Problem retreiving gateway ${uuid}. Reason ${error}`);
                    res.sendStatus(500);
                })
        }
    }

    export function Authorize(name: BeanName, ctx: Context): RequestHandler {
        let $gateway = ctx.get<GatewayRepo>(ServerBeans.GATEWAY_REPO);
        return function (req: Request, res: Response, next: NextFunction): void {
            let uuid = req.params['uuid'];
            $gateway.authorize(uuid)
                .then((result) => {
                    res.sendStatus(200);
                })
                .catch((error) => {
                    log.debug(`Problem authorizing gateway ${uuid}. Reason ${error}`);
                    res.sendStatus(500);
                })
        }
    }

    export function Delete(name: BeanName, ctx: Context): RequestHandler {
        let $gateway = ctx.get<GatewayRepo>(ServerBeans.GATEWAY_REPO);
        return function (req: Request, res: Response, next: NextFunction): void {
            let uuid = req.params['uuid'];
            $gateway.delete(uuid)
                .then((result) => {
                    res.sendStatus(200);
                })
                .catch((error) => {
                    log.debug(`Problem deleting gateway ${uuid}. Reason ${error}`);
                    res.sendStatus(500);
                });
        }
    }
}

