const { encrypt, decrypt, generateKeys } = require("./util/util")
const fs = require("fs").promises
const { userPath } = require("../config")
const { getUserStatusMsg } = require("./statusMap")


/**
 * @function: getUsers
 * @description: 获取用户名
 * @return {String} users 用户名
 * @author: Mr Xiao
 */
async function getUsers() {
    let users = await fs.readFile(userPath, "utf8")
    users = JSON.parse(users);
    return users
}

/**
 * @function: setUsers
 * @description: 设置用户名
 * @param {String} users 用户名
 * @return {Boolean} true  false 
 * @author: Mr Xiao
 */
async function setUsers(users) {

    try {
        await fs.writeFile(userPath, JSON.stringify(users), "utf8")
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}

/**
 * @function:appendUsers 
 * @description: 获取用户信息，写入user.json
 * @param {String} user_id 用户ID
 * @param {String} user_name 用户名
 * @param {String} password 密码
 * @return {Boolean} true 
 * @author: Mr Xiao
 */
async function appendUsers({ user_id = false, user_name = false, password = false, user_nickname = false }) {

    let user = await getUsers();

    user.push({
        user_id,
        user_nickname,
        user_name,
        password
    })
    setUsers(user);
    return true
}

/**
 * @function: getUsersNum
 * @description: 查询用户数据数组长度
 * @return {String} user?.length 数组长度
 * @author: Mr Xiao
 */
async function getUsersNum() {
    let user = await getUsers();

    return user?.length
}

module.exports = {
    /**
     * @function: addUser
     * @description: 用户注册
     * @param {String} username 用户名
     * @param {String} pwd 密码
     * @return {Object} Object 注册信息
     * @author: Mr Xiao
     */
    async addUser(nickname, username, pwd) {

        let user = await this.getUserInfo(username)

        //公钥加密
        let password = encrypt(pwd)
        if (user?.["tag"] === "USER_NOF") {
            let userID = await getUsersNum()
            userID = ("000000" + userID).substr(-6)
            try {
                await appendUsers({ user_id: userID, user_name: username, user_nickname: nickname, password })
                let resData = getUserStatusMsg("USER_ADD")
                resData.code = 200
                return {
                    ...resData,
                    data: {
                        user_id: userID, user_name: username, user_nickname: nickname
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (user?.["tag"] === "USER_FOND") {

            return {
                ...getUserStatusMsg("USER_DR")
            }
        }
        return {
            statusCode: user.code,
            message: "注册失败"
        }
    },

    /**
     * @function: getUserInfo
     * @description: 获取用户信息
     * @param {String} username 用户名
     * @return {Object} Object 用户信息
     * @author: Mr Xiao
     */
    async getUserInfo(username) {

        try {
            let users = await getUsers();
            let userInfo = users.find(item => item["user_name"].trim() === username.trim())
            if (!userInfo) {
                return {
                    ...getUserStatusMsg("USER_NOF")
                }
            }
            return {
                ...getUserStatusMsg("USER_FOND"),
                data: {
                    ...userInfo
                }
            }
        } catch (error) {
            console.error(error);

            return {
                ...getUserStatusMsg("USER_FERR")
            }
        }
    },

    /**
     * @function: verifyUser
     * @description: 登录验证
     * @param {String} username 用户名
     * @param {String} pwd 密码
     *  @return {Object} Object 用户信息
     * @author: Mr Xiao
     */
    async verifyUser(username, pwd) {

        let user = await this.getUserInfo(username)
        // console.log(user);
        if (user?.["tag"] !== "USER_FOND") {
            return user
        }

        let { user_nickname, user_name, user_id, password } = user.data


        //验证密码
        let isverify = decrypt(decrypt(password.trim())) === decrypt(pwd.trim());

        if (isverify) {
            return {
                ...getUserStatusMsg("USER_INN"),
                data: {
                    user_id, user_name, user_nickname
                }
            }
        } 
    },

    /**
     * @function: verifyToken
     * @description: 验证token
     * @param {String} username 用户名
     * @param {String} user_id 用户ID
     * @return {Objcet} Objcet 用户信息
     * @author: Mr Xiao
     */
    async verifyToken(username, userID) {
        try {
            let users = await getUsers();

            let userInfo = users.find(item => item["user_id"].trim() === userID.trim())
            if (!userInfo) {
                return {
                    ...getUserStatusMsg("USER_NOF")
                }
            }
            if (userInfo["user_name"] === username) {
                return {
                    ...getUserStatusMsg("USER_FOND"),
                }
            }
        } catch (error) {
            console.error(error);
            return {
                ...getUserStatusMsg("USER_FERR")
            }
        }
    }

}