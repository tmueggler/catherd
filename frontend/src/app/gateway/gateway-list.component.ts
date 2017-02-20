import {Component, OnInit} from "@angular/core";
import {Gateway} from "./gateway.model";
import {Http, Response} from "@angular/http";

@Component({
    selector: 'gateway-list',
    templateUrl: 'app/gateway/gateway-list.component.html'
})
export class GatewayListComponent implements OnInit {
    constructor(private http: Http) {
    }

    gateways: Gateway[] = [];

    ngOnInit() {
        this.http.get('http://localhost:3000/gateway/all')
            .subscribe((res: Response) => {
                this.gateways = res.json();
            });
    }
}