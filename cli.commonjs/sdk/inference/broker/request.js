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
    async getServiceMetadata(providerAddress, svcName) {
        const service = await this.getService(providerAddress, svcName);
        return {
            endpoint: `${service.url}/v1/proxy/${svcName}`,
            model: service.model,
        };
    }
    async getRequestHeaders(providerAddress, svcName, content) {
        const headers = await this.getHeader(providerAddress, svcName, content, BigInt(0));
        return headers;
    }
}
exports.RequestProcessor = RequestProcessor;
//# sourceMappingURL=request.js.map