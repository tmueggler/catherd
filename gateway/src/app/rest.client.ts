import {Url, parse as parseUrl} from "url";
import {request as httpRequest, RequestOptions, IncomingMessage} from "http";
import {Deferred, defer as newDefer} from "q";

export class RestClient {
    private url: Url;

    constructor(private baseUrl: string) {
        this.url = parseUrl(baseUrl);
    }

    get(path: string): Promise<any> {
        return this.exec(this.getOpts(path));
    }

    getJson(path: string): Promise<any> {
        return this.exec(this.getOpts(path), RestClient.stringToJson);
    }

    post(path: string, data?: any): Promise<any> {
        // TODO data
        return this.exec(this.postOpts(path));
    }

    postJson(path: string, data?: any): Promise<any> {
        // TODO data
        return this.exec(this.postOpts(path), RestClient.stringToJson);
    }


    private exec(opts: RequestOptions, convert?: (d: string) => any): Promise<any> {
        let defer: Deferred<any> = newDefer();
        let req = httpRequest(opts);
        req.on('response', (res: IncomingMessage) => {
            let rawdata: string;
            res.setEncoding('UTF-8');
            res.on('data', (chunk) => {
                rawdata += chunk;
            });
            res.on('end', () => {
                if (rawdata) {
                    let data = convert ? convert(rawdata) : rawdata;
                    defer.resolve(data);
                } else {
                    defer.resolve();
                }
            });
            res.on('error', (err) => {
                defer.reject(err);
            });
        });
        req.on('error', (err: any) => {
            defer.reject(err);
        });
        req.end();
        return <any>defer.promise; // Q.Promise is compatible with es6 Promise
    }

    private getOpts(path: string): RequestOptions {
        let opt = this.baseOpts();
        opt.method = 'GET';
        opt.path = path;
        return opt;
    }

    private postOpts(path: string): RequestOptions {
        let opt = this.baseOpts();
        opt.method = 'POST';
        opt.path = path;
        return opt;
    }

    private baseOpts(): RequestOptions {
        return {
            protocol: this.url.protocol,
            hostname: this.url.hostname,
            port: Number(this.url.port)
        }
    }

    private static stringToJson(str: string): any {
        return JSON.parse(str);
    }
}