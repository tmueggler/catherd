import * as http from "http";
import * as url from "url";

export class RegistrationService {
    private _url: url.Url;

    constructor(private baseUrl: string) {
        this._url = url.parse(baseUrl);
    }

    register(uuid: string) {
        let req = http.request(
            {
                protocol: this._url.protocol,
                hostname: this._url.hostname,
                port: Number(this._url.port),
                path: `/register/${uuid}`,
                method: 'POST'
            },
            res => {
                console.log(`Received response ${res}`);
            }
        );
        req.end();
    }

    deregister(uuid: string) {

    }
}