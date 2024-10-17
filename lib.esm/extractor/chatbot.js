import { Extractor } from './extractor';
export class ChatBot extends Extractor {
    svcInfo;
    constructor(svcInfo) {
        super();
        this.svcInfo = svcInfo;
    }
    getSvcInfo() {
        return Promise.resolve(this.svcInfo);
    }
    async getInputCount(content) {
        return content.split(/\s+/).length;
    }
    async getOutputCount(content) {
        return content.split(/\s+/).length;
    }
}
//# sourceMappingURL=chatbot.js.map