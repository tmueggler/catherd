import {Http, Response} from "@angular/http";
import {Observable} from "rxjs";
import {Gateway} from "@catherd/api/web";
import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";

@Injectable()
export class GatewayRepo {
    private readonly url: string;

    constructor(private readonly http: Http) {
        this.url = 'http://localhost:3000';
    }

    unauthorized(): Observable<Gateway.Info[]> {
        return this.http.get(`${this.url}/gateway/unauthorized`)
            .map((res) => res.json());
    }

    authorized(): Observable<Gateway.Info[]> {
        return this.http.get(`${this.url}/gateway/authorized`)
            .map((res) => res.json());
    }

    authorize(trg: Gateway.Info): Observable<Response> {
        return this.http.post(`${this.url}/gateway/authorize/${trg.uuid}`, null);
    }

    delete(trg: Gateway.Info): Observable<Response> {
        return this.http.delete(`${this.url}/gateway/${trg.uuid}`);
    }
}