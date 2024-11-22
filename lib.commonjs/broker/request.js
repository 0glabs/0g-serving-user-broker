"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestProcessor = void 0;
const base_1 = require("./base");
/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
class RequestProcessor extends base_1.ZGServingUserBrokerBase {
    async getRequestMetadata(providerAddress, svcName, content) {
        const service = await this.getService(providerAddress, svcName);
        const headers = await this.getHeader(providerAddress, svcName, content, 0);
        return {
            headers,
            endpoint: `${service.url}/v1/proxy/${svcName}`,
            model: service.model,
        };
    }
}
exports.RequestProcessor = RequestProcessor;
//# sourceMappingURL=request.js.map