const dgram = require('dgram');
const internalIp = require('internal-ip');
const client = dgram.createSocket('udp4');
const AES_GENERAL_KEY = 'a3K8Bx%2r8Y7#xDh';
const AES_DEVICE_KEY = 'a3K8Bx%2r8Y7#xdd';
const crypto = require('crypto');
const ip = internalIp.v4.sync();
const limits = {
  scan: 1
};
const reqs = {};
client.on('message', (buff, rinfo) => {
  const msg = JSON.parse(buff + '');
  // discovering
  if (limits[msg.t] && limits[msg.t] <= reqs[msg.t]) {
    return //console.log('wont reply to %s', msg.t);
  }
  reqs[msg.t] = (reqs[msg.t] || 0) + 1;
  const packet = msg.pack ? decrypt(msg, msg.i === 1 ? AES_GENERAL_KEY : AES_DEVICE_KEY) : {};
  console.log('Message arrived', msg, JSON.stringify(packet, null, 2));
  if (msg.t === 'scan') {
    console.log('reply');
    return send(client, rinfo, pack({
      t: 'pack',
      i: 1,
      uid: 0,
      cid: 'foo',
      pack: {
        t: 'dev',
        cid: 'foo',
        bc: 'gree',
        brand: 'gree',
        catalog: 'gree',
        mac: 'foo-mac',
        mid: '10001',
        model: 'gree',
        name: 'foo-device',
        series: 'gree',
        vender: '1',
        ver: 'V1.1.13',
        lock: 0
      }
    }));
  }
  // bounding
  if (packet.t === 'bind') {

    return send(client, rinfo, pack({
      t: 'pack',
      i: 1,
      uid: 0,
      cid: 'foo',
      tcid: '',
      pack: {
        t: 'bindok',
        mac: 'foo-mac',
        key: AES_DEVICE_KEY,
        r: 200
      }
    }));
  }
  if (packet.t === 'status') {

    return send(client, rinfo, pack({
      t: 'pack',
      i: 0,
      uid: 0,
      cid: 'foo',
      tcid: '',
      pack: {
        t: 'dat',
        mac: 'foo-mac',
        r: 200,
        cols:
        ['Pow',
          'Mod',
          'SetTem',
          'WdSpd',
          'Air',
          'Blo',
          'Health',
          'SwhSlp',
          'Lig',
          'SwingLfRig',
          'SwUpDn',
          'Quiet',
          'Tur',
          'StHt',
          'TemUn',
          'HeatCoolType',
          'TemRec',
          'SvSt'],
        dat: [1, 1, 22, 3, 0, 0, 0, 0, 1, 0, 11, 0, 0, 0, 0, 0, 0, 0]
      }
    }, AES_DEVICE_KEY));
  }
  if (packet.t === 'cmd') {
    return send(client, rinfo, pack({
      t: 'pack',
      i: 0,
      uid: 0,
      cid: 'foo',
      tcid: '',
      pack: {
        t: 'res',
        mac: 'foo-mac',
        r: 200,
        opt: packet.opt,
        p: packet.p,
        val: packet.p
      }
    }, AES_DEVICE_KEY))
  }
});
client.bind(7000);
function send(client, rinfo, msg) {
  const buff = new Buffer(msg);
  console.log('sending %s', buff + '')
  client.send(buff, 0, buff.length, rinfo.port, rinfo.address);
}
function pack(msg, KEY) {
  return JSON.stringify(Object.assign({}, msg, {
    pack: encrypt(msg.pack, KEY)
  }));
}
function encrypt(input, key = AES_GENERAL_KEY) {
  const cipher = crypto.createCipheriv('aes-128-ecb', key, '');
  const str = cipher.update(JSON.stringify(input), 'utf8', 'base64');
  const response = str + cipher.final('base64');
  return response;
}

function decrypt(input, key = AES_GENERAL_KEY) {
  try {
  const decipher = crypto.createDecipheriv('aes-128-ecb', key, '');
  console.log('decrypting %s', input.pack);
  const str = decipher.update(input.pack || '', 'base64', 'utf8');
  const response = JSON.parse(str + decipher.final('utf8'));
  return response;
  } catch (x) {
    console.error('failed to decrypt', input);
    console.error(x);
    process.exit(1);
  }
}