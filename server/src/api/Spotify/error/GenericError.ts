export default class GenericError extends Error {
    constructor(name, message, stack) {
        super(message);
        this.name = name;
        this.stack = stack;
    }
}
