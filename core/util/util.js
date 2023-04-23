const fs = require('fs');
const NodeRSA = require('node-rsa');
const { priKeyPath, pubKeyPath } = require('../../config');
const mongoPage = require('mongoose-sex-page');
const qs = require('qs')
const { compile } = require('morgan');


/**
 * @function: generateKeys
 * @description: 创建公钥及私钥
 * @author: Mr Xiao
 */
function generateKeys() {
  const newkey = new NodeRSA({ b: 512 });
  newkey.setOptions({ encryptionScheme: 'pkcs1' })
  let public_key = newkey.exportKey('pkcs8-public')//公钥,
  let private_key = newkey.exportKey('pkcs8-private') //私钥

  fs.writeFileSync(priKeyPath, private_key);
  fs.writeFileSync(pubKeyPath, public_key);
}

function encrypt(plain) {
  let public_key = fs.readFileSync(pubKeyPath, 'utf8');
  const nodersa = new NodeRSA(public_key);
  nodersa.setOptions({ encryptionScheme: 'pkcs1' });
  const encrypted = nodersa.encrypt(plain, 'base64');
  // console.log(encrypted)
  return encrypted;
}

function decrypt(cipher) {
  let private_key = fs.readFileSync(priKeyPath, 'utf8'); //私钥
  let prikey = new NodeRSA(private_key);
  prikey.setOptions({ encryptionScheme: 'pkcs1' });
  return prikey.decrypt(cipher, 'utf8')
}

async function pagination({ model, query, options, populate = {}, size, page, dis }) {
  if (typeof query === 'string') {
    query = qs.parse(query)
  }

  let result = await mongoPage(model).find(query).sort({ '_id': -1 }).populate(populate).select(options).size(size).page(page).display(dis).exec()

  let { total, records: list, pages, display } = result
  //count 当次返回的 list的长度 数据数量
  let count = list.length
  return { count, page, size, total, list, pages, display }
}


function toDouble (num) {
  return String(num)[1] && String(num) || '0' + num;
}


function formatDate (date = new Date(), format = "yyyy-MM-dd hh:mm:ss") {

  let regMap = {
    'y': date.getFullYear(),
    'M': toDouble(date.getMonth() + 1),
    'd': toDouble(date.getDate()),
    'h': toDouble(date.getHours()),
    'm': toDouble(date.getMinutes()),
    's': toDouble(date.getSeconds()),
  }

  //逻辑(正则替换 对应位置替换对应值) 数据(日期验证字符 对应值) 分离
  return Object.entries(regMap).reduce((acc, [reg, value]) => {
    return acc.replace(new RegExp(`${reg}+`, 'g'), value);
  }, format);
}

module.exports = {
  generateKeys,
  encrypt,
  decrypt,
  pagination,
  formatDate
};