import {Component, OnInit} from "@angular/core";
import {Http, Response} from "@angular/http";
import {GatewayControlService} from "./gateway-control.service";
import {Gateway} from "@catherd/api/web";

@Component({
    selector: 'gateway-list',
    templateUrl: 'app/gateway/gateway-authorized.component.html',
})
export class GatewayAuthorizedComponent implements OnInit {
    private readonly url: string;

    constructor(private http: Http, private readonly control: GatewayControlService) {
        this.url = 'http://localhost:3000';
    }

    gateways: Gateway.Info[] = [];

    ngOnInit() {
        this.http.get(`${this.url}/gateway/authorized`)
            .subscribe((res: Response) => {
                this.gateways = res.json();
            });
    }

    delete(trg: Gateway.Info) {
        this.http.delete(`${this.url}/gateway/${trg.uuid}`)
            .subscribe((res: Response) => {
                // TODO update model
            });
    }

    restart(trg: Gateway.Info) {
        this.control.restart(trg);
    }

    update(trg: Gateway.Info) {
        this.control.update(trg);
    }

    shutdown(trg: Gateway.Info) {
        this.control.shutdown(trg);
    }
}