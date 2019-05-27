"use strict"

const {logger} = require('../general/logger')
const path = require("path")
const homedir = require('os').homedir()
const fs = require('fs')
const storeDir = path.join(homedir, 'upnext')
const dbDir = path.join(homedir, 'upnext', 'db')
const db = require('diskdb')

let _instance = null

class Database {
    constructor() {
        this.database = null
        this.DATABASE_TABLES = ['party']
        logger.info("[DB] Start Loading DB...")
        if (!fs.existsSync(storeDir)) {
            fs.mkdirSync(storeDir)
            logger.info("[DB] create upnext dir on home")
        }
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir)
            logger.info("[DB] create db dir on upnext dir")
        }
        logger.info("[DB] Connecting to db...")
        this.database = db.connect(dbDir, this.DATABASE_TABLES)
        logger.info("[DB] Connected to db")
    }

    static getInstance() {
        if (!!!_instance) {
            _instance = new Database()
        }
        return _instance
    }

    find(jsonFind) {
        return this.database.party.find(jsonFind)
    }

    getDatabase() {
        return this.database
    }

    getAllParties() {
        return this.database.party.find()
    }

    getParty(partyID) {
        return this.database.party.find({_id: partyID})[0]
    }

    updateParty(partyID, thingToUpdate) {
        return this.database.party.update({_id: partyID}, thingToUpdate)
    }

    add(thingToAdd) {
        this.database.party.save(thingToAdd)
    }

    deleteParty(partyID) {
        this.database.party.remove({_id: partyID})
    }
}

module.exports = {
    Database
}
