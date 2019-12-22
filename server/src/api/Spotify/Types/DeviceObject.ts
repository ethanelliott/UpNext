export default class DeviceObject {
    public id: string;
    public is_active: boolean;
    public is_private_session: boolean;
    public is_restricted: boolean;
    public name: string;
    public type: string;
    public volume_percent: number;

    public constructor() {
    }
}
