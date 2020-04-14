import { Service } from "typedi";

import QRCode from 'qrcode';

@Service()
export default class QRService {

    constructor() {
    }

    public async generateFrom(data: string, dark: string, light: string): Promise<string> {
        return await QRCode.toDataURL(data, {errorCorrectionLevel: 'H', color: {dark, light}});
    }

}
