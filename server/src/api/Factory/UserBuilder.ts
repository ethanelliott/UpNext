import User from "../Types/User";

export default class UserBuilder {
    private name: string;
    private id: string;

    constructor() {
    }

    public static make(): UserBuilder {
        return new UserBuilder();
    }

    public withName(name: string): UserBuilder {
        this.name = name;
        return this;
    }

    public withId(id: string): UserBuilder {
        this.id = id;
        return this;
    }

    public build(): User {
        let p = new User();
        p.name = this.name;
        p.id = this.id;
        return p;
    }

}
