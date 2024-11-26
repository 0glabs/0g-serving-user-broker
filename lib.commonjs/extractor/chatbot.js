"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatBot = void 0;
const extractor_1 = require("./extractor");
class ChatBot extends extractor_1.Extractor {
    svcInfo;
    constructor(svcInfo) {
        super();
        this.svcInfo = svcInfo;
    }
    getSvcInfo() {
        return Promise.resolve(this.svcInfo);
    }
    async getInputCount(content) {
        if (!content) {
            return 0;
        }
        return content.split(/\s+/).length;
    }
    async getOutputCount(content) {
        if (!content) {
            return 0;
        }
        return content.split(/\s+/).length;
    }
}
exports.ChatBot = ChatBot;
//# sourceMappingURL=chatbot.js.map