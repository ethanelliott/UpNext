"use strict"

const {logger} = require('./logger')
const path = require("path")
const homedir = require('os').homedir()
const fs = require('fs')
const storeDir = path.join(homedir, 'upnext')
const dbDir = path.join(homedir, 'upnext', 'db')
const db = require('diskdb')

class Database {
    constructor() {
        this.database = null
        this.DATABASE_TABLES = ['party']
        logger.info("Start Loading DB...")
        if (!fs.existsSync(storeDir)) {
            fs.mkdirSync(storeDir)
            logger.info("create upnext dir on home")
        }
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir)
            logger.info("create db dir on upnext dir")
        }
        logger.info("Connecting to db...")
        this.database = db.connect(dbDir, this.DATABASE_TABLES)
        logger.info("Connected to db")
    }

    static getInstance() {
        if (!!!this.instance) {
            this.instance = new Database()
        }
        return this.instance
    }

    getDatabase() {
        return this.database
    }
}

module.exports = {
    Database
}
