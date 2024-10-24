export declare const REQUEST_LENGTH = 40;
export declare enum ModelTypeEnum {
    Chat = "chat",
    Image = "image"
}
export type ModelType = ModelTypeEnum.Chat | ModelTypeEnum.Image;
export interface ModelLib {
    [key: string]: {
        Name: string;
        Type: string;
        Author?: string;
        Description?: string;
        HuggingFaceURL?: string;
        ZGAlignmentScore?: string;
        UserInteractedNumber: number;
    };
}
export declare const MODEL_LIB: ModelLib;
//# sourceMappingURL=const.d.ts.map