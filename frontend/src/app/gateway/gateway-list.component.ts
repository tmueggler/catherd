import {Component, OnInit} from "@angular/core";
import {Gateway} from "./gateway.model";
import {Http, Response} from "@angular/http";
import {GatewayControlService} from "./gateway-control.service";

@Component({
    selector: 'gateway-list',
    templateUrl: 'app/gateway/gateway-list.component.html',
})
export class GatewayListComponent implements OnInit {
    private readonly url: string;

    constructor(private http: Http, private readonly control: GatewayControlService) {
        this.url = 'http://localhost:3000';
    }

    gateways: Gateway[] = [];

    ngOnInit() {
        this.http.get(`${this.url}/gateway/all`)
            .subscribe((res: Response) => {
                this.gateways = res.json();
            });
    }

    delete(trg: Gateway) {
        this.http.delete(`${this.url}/gateway/${trg.uuid}`)
            .subscribe((res: Response) => {
                // TODO update model
            });
    }

    restart(trg: Gateway) {
        this.control.restart(trg);
    }

    update(trg: Gateway) {
        this.control.update(trg);
    }

    shutdown(trg: Gateway) {
        this.control.shutdown(trg);
    }
}