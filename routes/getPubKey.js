const express = require('express');
const router = express.Router();
const { getPubliKey } = require("../core/rsa")
const Key = require('../models/Key');


router.get('/', async (req, res, next) => {
    let result = await Key.findOne()
    res.send(200, {
        code: 200,
        message: "ok",
        data: {
            pubKey: result.key
        }
    })
});

module.exports = router;

