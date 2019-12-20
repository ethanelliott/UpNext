import glob from 'glob';

export function getOsEnv(key: string): string {
    if (typeof process.env[key] === 'undefined') {
        throw new Error(`Environment variable ${key} is not set.`);
    }

    return process.env[key] as string;
}

export function getOsPaths(key: string): string[] {
    let out: string[] = [];
    getOsEnvArray(key).map(p => glob.sync(p)).forEach(p => out.push(...p));
    return out;
}

export function getOsEnvArray(key: string, delimiter: string = ','): string[] {
    return process.env[key] && process.env[key].split(delimiter) || [];
}

export function normalizePort(port: string): number {
    const parsedPort = parseInt(port, 10);
    if (parsedPort >= 0) {
        return parsedPort;
    }
    return null;
}
