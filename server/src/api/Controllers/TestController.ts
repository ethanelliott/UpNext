import 'reflect-metadata';
import { Get, JsonController } from 'routing-controllers';

@JsonController('/test')
export class TestController {

    constructor() {
    }

    @Get()
    public test(): object {
        return {res: true};
    }
}
