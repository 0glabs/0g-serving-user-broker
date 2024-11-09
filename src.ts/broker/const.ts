import { VerifiabilityEnum, ZGServingModel } from './model'

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
    'llama-3.2-1B': {
        Name: 'llama-3.2-1B',
        Type: ModelTypeEnum.Chat,
        Author: 'meta',
        Description: '',
        HuggingFaceURL: 'https://huggingface.co/meta-llama/Llama-3.2-1B',
        ZGAlignmentScore: '2.3',
        UserInteractedNumber: 100,
    },
    'stable-diffusion-3.5-medium': {
        Name: 'stable-diffusion-3.5-medium',
        Type: ModelTypeEnum.Image,
        Author: 'stabilityai',
        Description: '',
        HuggingFaceURL:
            'https://huggingface.co/stabilityai/stable-diffusion-3.5-medium',
        ZGAlignmentScore: '2.5',
        UserInteractedNumber: 100,
    },
    'stable-diffusion-xl-base-1.0': {
        Name: 'stable-diffusion-xl-base-1.0',
        Type: ModelTypeEnum.Image,
        Author: 'stabilityai',
        Description: '',
        HuggingFaceURL:
            'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0',
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
    'phi-3.5-mini-instruct': {
        Name: 'phi-3.5-mini-instruct',
        Type: ModelTypeEnum.Chat,
        Author: 'microsoft',
        Description: '',
        HuggingFaceURL:
            '"https://huggingface.co/microsoft/Phi-3.5-mini-instruct"',
        ZGAlignmentScore: '2.4',
        UserInteractedNumber: 100,
    },
}

// TODO: remove mock data
export const MOCK_AREA = [
    'North America',
    'South America',
    'Europe',
    'Africa',
    'East Asia',
]

// TODO: remove mock data
export const MOCK_DATA: ZGServingModel[] = [
    {
        Name: 'llama-3.2-1B',
        Type: 'chat',
        Author: 'meta',
        Description: '',
        HuggingFaceURL: 'https://huggingface.co/meta-llama/Llama-3.2-1B',
        ZGAlignmentScore: '2.3',
        UserInteractedNumber: 100,
        Price: '$0.1~$0.2',
        Verifiability: VerifiabilityEnum.TeeML,
        Providers: [],
    },
    {
        Name: 'stable-diffusion-3.5-medium',
        Type: 'image',
        Author: 'stabilityai',
        Description: '',
        HuggingFaceURL:
            'https://huggingface.co/stabilityai/stable-diffusion-3.5-medium',
        ZGAlignmentScore: '2.5',
        UserInteractedNumber: 100,
        Price: '$0.1~$0.2',
        Verifiability: VerifiabilityEnum.TeeML,
        Providers: [],
    },
    {
        Name: 'stable-diffusion-xl-base-1.0',
        Type: 'image',
        Author: 'stabilityai',
        Description: '',
        HuggingFaceURL:
            'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0',
        ZGAlignmentScore: '2.3',
        UserInteractedNumber: 100,
        Price: '$0.1~$0.2',
        Verifiability: VerifiabilityEnum.OpML,
        Providers: [],
    },
    {
        Name: 'phi-3.5-mini-instruct',
        Type: 'chat',
        Author: 'microsoft',
        Description: '',
        HuggingFaceURL:
            '"https://huggingface.co/microsoft/Phi-3.5-mini-instruct"',
        ZGAlignmentScore: '2.4',
        UserInteractedNumber: 100,
        Price: '$0.1~$0.3',
        Verifiability: VerifiabilityEnum.OpML,
        Providers: [],
    },
]
