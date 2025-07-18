import type { SignatureBuffer, PrivateKey } from './crypto';
import type { Request } from './request';
export declare const FIELD_SIZE = 32;
export declare function signRequests(requests: Request[], privateKey: PrivateKey): Promise<SignatureBuffer[]>;
//# sourceMappingURL=helper.d.ts.map