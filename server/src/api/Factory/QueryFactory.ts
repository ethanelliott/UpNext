import { Create, Delete, Insert, Select, Update } from "../Types/DatabaseMaps/Database";
import logger from "../../util/Log";

export default class QueryFactory {
    constructor() {
    }

    static logStatement(query: string): void {
        logger.silly(`[QUERY] ${query}`);
    }

    static buildQueryFrom(params: Select): string {
        let query = `SELECT ${params.select.join(', ')}`;
        query += ` FROM ${params.from} `;
        if (params.where) {
            query += `WHERE ${params.where.map((k) => `${k.key} ${k.operator} ?`).join(' AND ')} `;
        }
        QueryFactory.logStatement(query);
        return query;
    }

    static buildInsertFrom(params: Insert): string {
        let query = `INSERT INTO ${params.into} (${Object.keys(params.insert).join(', ')}) `;
        query += `VALUES (${Object.values(params.insert).map((k, index) => `?`).join(', ')}) `;
        QueryFactory.logStatement(query);
        return query;
    }

    static buildUpdateFrom(params: Update): string {
        let query = `UPDATE ${params.update} `;
        let setParams = Object.keys(params.set);
        if (setParams.length > 0) {
            query += `SET ${setParams.map((k, index) => `${k} = ?`).join(', ')} `;
        }
        if (params.where) {
            query += `WHERE ${params.where.map((k) => `${k.key} ${k.operator} ?`).join(' AND ')} `;
        }
        QueryFactory.logStatement(query);
        return query;
    }

    static buildDeleteFrom(params: Delete): string {
        let query = `DELETE FROM ${params.from} `;
        if (params.where) {
            query += `WHERE ${params.where.map((k) => `${k.key} ${k.operator} ?`).join(' AND ')} `;
        }
        QueryFactory.logStatement(query);
        return query;
    }

    static buildCreateFrom(params: Create): string {
        let query = `CREATE TABLE "${params.name}" (`;
        if (params.columns && params.columns.length > 0) {
            query += `${params.columns.map((k) =>
                `"${k.name}" ${k.type.toUpperCase()}${k.notNull ? ' NOT NULL' : ''}${k.defaultValue !== undefined ? ' DEFAULT ' + k.defaultValue : ''}${k.autoIncrement ? ' PRIMARY KEY AUTOINCREMENT' : ''}${k.unique ? ' UNIQUE' : ''}`
            ).join(', ')}`;
            query += `${params.columns.filter(e => !!e.primaryKey).map((k) =>
                `, PRIMARY KEY ("${k.name}")`
            ).join('')}`;
            query += `${params.columns.filter(e => !!e.foreignKey).map((k) =>
                `, FOREIGN KEY ("${k.name}") REFERENCES "${k.foreignKey.table}"("${k.foreignKey.name}") ON DELETE CASCADE`
            ).join('')}`;
        }

        query += ');';
        QueryFactory.logStatement(query);
        return query;
    }
}