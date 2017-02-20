import {RestClient} from "./rest.client";

export class RegistrationService {
    constructor(private $rest: RestClient) {
    }

    register(uuid: string): Promise<any> {
        return this.$rest.post(`/register/${uuid}`);
    }

    deregister(uuid: string): Promise<any> {
        return this.$rest.post(`/deregister/${uuid}`);
    }
}