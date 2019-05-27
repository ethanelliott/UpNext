const {logger} = require('../general/logger')
const axios = require('axios/index')

const get = async (url, headers) => {
    logger.debug(`GET Request for: ${url}`)
    return await axios({
        method: 'get',
        url: url,
        headers: headers
    })
}

const post = async (url, data, params, headers) => {
    logger.debug(`POST Request for: ${url}`)
    return await axios({
        method: 'post',
        url: url,
        data: data,
        params: params,
        headers: headers
    })
}

const put = async (url, data, headers) => {
    logger.debug(`PUT Request for: ${url}`)
    return await axios({
        method: 'put',
        url: url,
        data: data,
        headers: headers
    })
}

module.exports = {
    get,
    post,
    put
}
