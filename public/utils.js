const fs = require('fs');
const crypto = require('crypto');

function getBase(path) {
  var data = '';
  if(fs.existsSync(path)){
    data = fs.readFileSync(path, 'utf-8');
  }
  return data;
}

function genHashCode(code){
  const hash = crypto.createHash('md5');
  hash.update(code)
  return hash.digest('hex')
}

module.exports = {
  getBase,
  genHashCode
};