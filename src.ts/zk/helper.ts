import { 
    packPoint,
    babyJubJubSignature,
    babyJubJubVerify,
    packSignature,
    unpackPoint,
    unpackSignature,
    babyJubJubGeneratePublicKey,
    PublicKey,
    SignatureBuffer,
    PrivateKey,
    Signature,
    PointBuffer,
} from './crypto';
import { Request } from './request';

export const FIELD_SIZE = 32;

type ProofInput = {
    signer: PublicKey;
    serializedRequest: Uint8Array[];
    r8: Uint8Array[];
    s: Uint8Array[];
};

export async function generateProofInput(
    requests: Request[],
    l: number,
    pubkey: PublicKey,
    signBuff: SignatureBuffer[]
): Promise<ProofInput> {
    
    const r8: Uint8Array[] = [];
    const s: Uint8Array[] = [];
    for (let i = 0; i < signBuff.length; i++) {
        r8.push(new Uint8Array(signBuff[i].slice(0, FIELD_SIZE)));
        s.push(new Uint8Array(signBuff[i].slice(FIELD_SIZE, FIELD_SIZE * 2)));
    }

    const paddingResult = paddingSignature(requests, r8, s, l);
    const input: ProofInput = {
        serializedRequest: paddingResult.serializedRequestTrace,
        signer: pubkey,
        r8: paddingResult.r8,
        s: paddingResult.s
    };

    return input;
}

type PackedSignerAndSignatures = {
    packPubkey: PointBuffer;
    r8: SignatureBuffer[];
    s: SignatureBuffer[];
};

export async function signAndVerifyRequests(
    requests: Request[],
    privateKey: PrivateKey,
    publicKey: PublicKey
): Promise<PackedSignerAndSignatures> {
    const packPubkey = await packPoint(publicKey);
    const signatures: Signature[] = [];
    const r8: SignatureBuffer[] = [];
    const s: SignatureBuffer[] = [];
    
    const serializedRequestTrace = requests.map(request => request.serialize());
    
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await babyJubJubSignature(serializedRequestTrace[i], privateKey);
        signatures.push(signature);
        const isValid = await babyJubJubVerify(serializedRequestTrace[i], signature, publicKey);
        console.log("Signature", i, "is valid:", isValid);
        
        const packedSig = await packSignature(signature);
        r8.push(packedSig.slice(0, FIELD_SIZE));
        s.push(packedSig.slice(FIELD_SIZE, FIELD_SIZE * 2));
    }

    return { packPubkey, r8, s };
}

export async function signRequests(
    requests: Request[],
    privateKey: PrivateKey
): Promise<SignatureBuffer[]> {
    const serializedRequestTrace = requests.map(request => request.serialize());
    const signatures: SignatureBuffer[] = [];
    
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await babyJubJubSignature(serializedRequestTrace[i], privateKey);
        signatures.push(await packSignature(signature));
    }
    
    return signatures;
}

export async function verifySig(
    requests: Request[],
    packedSignatures: SignatureBuffer[],
    publicKey: PublicKey
): Promise<boolean[]> {
    const isValid: boolean[] = [];
    const serializedRequestTrace = requests.map(request => request.serialize());
    
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await unpackSignature(packedSignatures[i]);
        isValid.push(
            await babyJubJubVerify(serializedRequestTrace[i], signature, publicKey)
        );
    }
    
    return isValid;
}

type PaddingResult = {
    serializedRequestTrace: Uint8Array[];
    r8: SignatureBuffer[];
    s: SignatureBuffer[];
};

function paddingSignature(
    requests: Request[],
    r8: SignatureBuffer[],
    s: SignatureBuffer[],
    l: number
): PaddingResult {
    if (l < requests.length) {
        throw new Error('l must be greater than or equal to the length of serializedRequestTrace');
    }

    const lastRequest = requests[requests.length - 1];
    const lastR8 = r8[r8.length - 1];
    const lastS = s[s.length - 1];
    let currentNonce = lastRequest.getNonce();

    for (let i = requests.length; i < l; i++) {
        currentNonce += 1;
        const noopRequest = new Request(
            currentNonce,
            0,
            '0x' + lastRequest.getUserAddress().toString(16),  
            '0x' + lastRequest.getProviderAddress().toString(16) 
        );
        requests.push(noopRequest);
        r8.push(lastR8);
        s.push(lastS);
    }

    const serializedRequestTrace = requests.map(request => request.serialize());
    return { serializedRequestTrace, r8, s };
}

export async function genPubkey(privkey: PrivateKey): Promise<PublicKey> {
    return babyJubJubGeneratePublicKey(privkey);
}