"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelProcessor = exports.VerifiabilityEnum = void 0;
const base_1 = require("./base");
const const_1 = require("./const");
var VerifiabilityEnum;
(function (VerifiabilityEnum) {
    VerifiabilityEnum["Basic"] = "Basic";
    VerifiabilityEnum["Secure"] = "Secure";
    VerifiabilityEnum["UltraSecure"] = "Ultra-Secure";
})(VerifiabilityEnum || (exports.VerifiabilityEnum = VerifiabilityEnum = {}));
/**
 * serviceProcessor 包含对 0G Serving Contract 上的 Service/Models 的 list 操作，
 */
class ModelProcessor extends base_1.ZGServingUserBrokerBase {
    async listService() {
        try {
            const services = await this.contract.listService();
            return services;
        }
        catch (error) {
            console.error('List Service Error:', error);
            throw error;
        }
    }
    /**
     * listModels 列出 models
     *
     * @returns models
     */
    async listModels() {
        try {
            const services = await this.listService();
            return ModelProcessor.groupByModel(services);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getModel 得到 model 的详细信息，以及下属 provider 列表
     *
     * @param name - model 名称。
     * @returns headers。记录着请求的费用、用户签名等信息。
     */
    async getModel(name) {
        try {
            const model = (await this.listModels())?.find((model) => model.Name === name);
            if (!model) {
                const error = new Error(`model ${name} not found`);
                console.error(error.message);
                throw error;
            }
            return model;
        }
        catch (error) {
            throw error;
        }
    }
    static groupByModel(items) {
        const sortedServices = [...items].sort((a, b) => {
            const nameA = a[1].toLowerCase(); // 提取 `name` 并转换为小写
            const nameB = b[1].toLowerCase(); // 提取 `name` 并转换为小写
            if (nameA < nameB) {
                return -1; // nameA 比 nameB 排在前面
            }
            if (nameA > nameB) {
                return 1; // nameA 比 nameB 排在后面
            }
            return 0; // nameA 和 nameB 相等
        });
        const grouped = sortedServices.reduce((acc, item) => {
            const model = item.model;
            if (!const_1.MODEL_LIB[model]) {
                return acc;
            }
            if (!acc[model]) {
                acc[model] = {
                    Name: const_1.MODEL_LIB[model].Name,
                    Type: const_1.MODEL_LIB[model].Type,
                    Author: const_1.MODEL_LIB[model].Author,
                    Description: const_1.MODEL_LIB[model].Description,
                    HuggingFaceURL: const_1.MODEL_LIB[model].HuggingFaceURL,
                    ZGAlignmentScore: const_1.MODEL_LIB[model].ZGAlignmentScore,
                    UserInteractedNumber: const_1.MODEL_LIB[model].UserInteractedNumber,
                    Price: '',
                    Verifiability: VerifiabilityEnum.Basic,
                    Providers: [],
                };
            }
            acc[model].Providers.push(ModelProcessor.parseService(item));
            return acc;
        }, {});
        const ret = Object.values(grouped);
        for (let i = 0; i < ret.length; i++) {
            const inputPrice = ret[i].Providers.map((p) => p.InputPrice);
            const outPrice = ret[i].Providers.map((p) => p.OutputPrice);
            const maxPrice = Math.max(...inputPrice, ...outPrice);
            const minPrice = Math.min(...inputPrice, ...outPrice);
            ret[i].Verifiability = ModelProcessor.getModelVerifiability(ret[i].Providers);
            ret[i].Price = `$${minPrice}~$${maxPrice}`;
        }
        return ret.concat(const_1.MOCK_DATA);
    }
    static parseService(service) {
        const priorityRandom = [
            VerifiabilityEnum.Basic,
            VerifiabilityEnum.Secure,
            VerifiabilityEnum.UltraSecure,
        ];
        return {
            AttestationDownLoadEndpoint: `${service.url}/v1/proxy/${service.name}/attestation/report`,
            Model: service.model,
            Name: service.name,
            InputPrice: Number(service.inputPrice),
            OutputPrice: Number(service.outputPrice),
            ProviderAddress: service.provider,
            ServiceType: service.serviceType,
            UpdatedAt: service.updatedAt.toString(),
            URL: service.url,
            // TODO: remove Mock data
            Device: 'H100',
            Geolocation: const_1.MOCK_AREA[Math.floor(Math.random() * 5)],
            Uptime: `${(100 - Math.floor(Math.random() * 5)).toString()}%`,
            Verifiability: priorityRandom[Number(service.inputPrice) >= 3
                ? 2
                : Number(service.inputPrice) >= 2
                    ? 1
                    : 0],
        };
    }
    static getModelVerifiability(services) {
        const priority = [
            VerifiabilityEnum.UltraSecure,
            VerifiabilityEnum.Secure,
            VerifiabilityEnum.Basic,
        ];
        for (const p of priority) {
            if (services.find((item) => item.Verifiability === p)) {
                return p;
            }
        }
        return VerifiabilityEnum.Basic;
    }
}
exports.ModelProcessor = ModelProcessor;
//# sourceMappingURL=model.js.map