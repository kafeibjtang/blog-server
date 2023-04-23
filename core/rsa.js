const { encrypt, decrypt, generateKeys } = require("./util/util")
const fs = require("fs").promises
const fsSync = require("fs")
const { pubKeyPath, priKeyPath } = require("../config")

module.exports = {


    getPubliKeySync() {
        return fsSync.readFileSync(pubKeyPath, "utf8")
    },

    /**
     * @function: getPubliKey
     * @description: 获取公钥工具函数
     * @return {String} key 公钥
     * @author: Mr Xiao
     */
    async getPubliKey() {
        let key
        try {
            key = await fs.readFile(pubKeyPath, "utf8")
        } catch (error) {
            //未读取到公钥文件则重新创建
            generateKeys()
            key = await fs.readFile(pubKeyPath, "utf8")
        }
        return key
    },
    /**
     * @function: getPrivaveKey
     * @description: 获取私钥
     * @return {String} 私钥
     * @author: Mr Xiao
     */
    async getPrivaveKey() {
        let key
        try {
            key = await fs.readFile(priKeyPath, "utf8")
        } catch (error) {
            //未读取到公钥文件则重新创建
            generateKeys()
            key = await fs.readFile(priKeyPath, "utf8")
        }
        return key
    }
}