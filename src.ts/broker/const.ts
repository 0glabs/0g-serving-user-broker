export const REQUEST_LENGTH = 40

export enum ModelTypeEnum {
    Chat = 'chat',
    Image = 'image',
}

export type ModelType = ModelTypeEnum.Chat | ModelTypeEnum.Image

export interface ModelLib {
    [key: string]: {
        Name: string
        Type: string
        Author?: string
        Description?: string
        HuggingFaceURL?: string
        ZGAlignmentScore?: string
        UserInteractedNumber: number
    }
}

export const MODEL_LIB: ModelLib = {
    'llama-3.1-8B-Instruct': {
        Name: 'llama-3.1-8B-Instruct',
        Type: ModelTypeEnum.Chat,
        Author: 'meta',
        Description:
            'The Meta Llama 3.1 collection includes the Llama-3.1-8B-Instruct, a multilingual large language model optimized for dialogue use cases. This 8 billion parameter model is pretrained and instruction tuned to excel in text-based interaction across multiple languages. It outperforms many available open source and closed chat models on common industry benchmarks.',
        HuggingFaceURL:
            'https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct',
        ZGAlignmentScore: '2.3',
        UserInteractedNumber: 100,
    },
    'phi-3-mini-4k-instruct': {
        Name: 'phi-3-mini-4k-instruct',
        Type: ModelTypeEnum.Chat,
        Author: 'microsoft',
        Description:
            'The Phi-3-Mini-4K-Instruct is a 3.8B parameters, lightweight, state-of-the-art open model trained with the Phi-3 datasets that includes both synthetic data and the filtered publicly available websites data with a focus on high-quality and reasoning dense properties. The model belongs to the Phi-3 family with the Mini version in two variants 4K and 128K which is the context length (in tokens) that it can support.',
        HuggingFaceURL:
            '"https://huggingface.co/microsoft/Phi-3-mini-4k-instruct"',
        ZGAlignmentScore: '2.4',
        UserInteractedNumber: 100,
    },
}
