const {logger} = require('../general/logger')
const axios = require('axios/index')

const get = async (url, token) => {
    logger.debug(`GET Request for: ${url}`)
    return await axios({
        method: 'get',
        url: url,
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
}

const post = async (url, token, data, params) => {
    logger.debug(`POST Request for: ${url}`)
    return await axios({
        method: 'post',
        url: url,
        data: data,
        params: params,
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
}

const put = async (url, token, data) => {
    logger.debug(`PUT Request for: ${url}`)
    return await axios({
        method: 'put',
        url: url,
        data: data,
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
}

module.exports = {
    get,
    post,
    put
}
