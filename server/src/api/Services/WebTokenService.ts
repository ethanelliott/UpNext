import { Service } from "typedi";
import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import { env } from "../../env";

@Service()
export default class WebTokenService {
    private readonly secretKey: string;
    private readonly encryptionOptions: SignOptions;
    private readonly algorithm = 'HS512';
    private readonly expiry = '12h';

    private readonly issuer = 'UpNext';
    private readonly decryptionOptions: VerifyOptions;

    constructor() {
        this.secretKey = env.app.jwt.key;
        this.encryptionOptions = {
            algorithm: this.algorithm,
            expiresIn: this.expiry,
            issuer: this.issuer
        };
        this.decryptionOptions = {
            algorithms: [this.algorithm],
            issuer: this.issuer
        };
    }

    public generateFrom(data: object, expire: string = this.expiry): string {
        this.encryptionOptions.expiresIn = expire;
        return sign(data, this.secretKey, this.encryptionOptions);
    }

    public verify(jwt: string): VerifyResponse<any> {
        let data = {};
        let error = null;
        try {
            data = verify(jwt, this.secretKey, this.decryptionOptions);
        } catch (e) {
            error = {name: e.name, message: e.message};
        }
        return {error, data};
    }
}

class VerifyResponse<T> {
    error: any;
    data: T;
}
