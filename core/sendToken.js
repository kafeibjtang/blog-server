const jwt = require("jsonwebtoken")
const { getPrivaveKey } = require("../core/rsa")


module.exports = {
    async sendToken(result) {
        let { username, _id } = result
        let privetekey = await getPrivaveKey()
        // console.log(privetekey);
        let token = jwt.sign({ username, _id, exp: ~~((Date.now() / 1000) + 24 * 3600 * 3) }, privetekey, { algorithm: 'RS256' });
        return {
            token,
        }
    }
}
// ~~((Date.now() / 1000) + 24 * 3600 * 3)