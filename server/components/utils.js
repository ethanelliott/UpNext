"use strict"
const {Database} = require('./database')
const db = Database.getInstance().getDatabase()

const getParty = partyID => db.party.find({_id: partyID})[0]

const updateParty = (partyID, thingToUpdate) => db.party.update({_id: partyID}, thingToUpdate)

module.exports = {
    getParty,
    updateParty
}
