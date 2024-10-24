import { ZGServingUserBrokerBase } from './base';
import { MODEL_LIB } from './const';
export var VerifiabilityEnum;
(function (VerifiabilityEnum) {
    VerifiabilityEnum["Basic"] = "Basic";
    VerifiabilityEnum["Secure"] = "Secure";
    VerifiabilityEnum["UltraSecure"] = "Ultra-Secure";
})(VerifiabilityEnum || (VerifiabilityEnum = {}));
/**
 * serviceProcessor 包含对 0G Serving Contract 上的 Service/Models 的 list 操作，
 */
export class ModelProcessor extends ZGServingUserBrokerBase {
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
    async listModels() {
        try {
            const services = await this.listService();
            return ModelProcessor.groupByModel(services);
        }
        catch (error) {
            throw error;
        }
    }
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
        const grouped = items.reduce((acc, item) => {
            const model = item.model;
            if (!MODEL_LIB[model]) {
                return acc;
            }
            if (!acc[model]) {
                acc[model] = {
                    Name: MODEL_LIB[model].Name,
                    Type: MODEL_LIB[model].Type,
                    Author: MODEL_LIB[model].Author,
                    Description: MODEL_LIB[model].Description,
                    HuggingFaceURL: MODEL_LIB[model].HuggingFaceURL,
                    ZGAlignmentScore: MODEL_LIB[model].ZGAlignmentScore,
                    UserInteractedNumber: MODEL_LIB[model].UserInteractedNumber,
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
        return ret;
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
            Geolocation: 'North America',
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
//# sourceMappingURL=model.js.map