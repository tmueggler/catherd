import {Logger} from "../main/logger";
import {LoggerFactory} from "../main/logger.factory";

describe("Using the logger factory", () => {
    const NAME: string = 'test.logger';

    it("should return a logger instance", () => {
        let log: Logger = LoggerFactory.get(NAME);
        expect(log).toBeDefined();
        expect(log).not.toBeNull();
    });
});