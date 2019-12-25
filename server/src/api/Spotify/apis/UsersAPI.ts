import WebAPIRequestBuilder from "../Requests/WebAPIRequestBuilder";
import { HttpMethods } from "../Types/HttpMethods";
import PrivateUserObject from "../Types/PrivateUserObject";
import { plainToClass } from "class-transformer";
import PublicUserObject from "../Types/PublicUserObject";

export default class UsersAPI {

    constructor() {
    }

    public async getCurrent(token: string): Promise<PrivateUserObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath("/v1/me")
            .build()
            .execute();
        return plainToClass(PrivateUserObject, d);
    }

    public async getById(token: string, userId: string): Promise<PublicUserObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/users/${userId}`)
            .build()
            .execute();
        return plainToClass(PublicUserObject, d);
    }
}
