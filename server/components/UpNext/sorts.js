"use strict"
const playlistSort = ($a, $b) => {
    let n = $b.votes - $a.votes
    if (n !== 0) return n
    return $a.added.time - $b.added.time
}

const userSort = ($a, $b) => ($b.score - $a.score)

module.exports = {
    playlistSort,
    userSort
}
