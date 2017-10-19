const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const crypto = require('crypto');
const AES_GENERAL_KEY = 'a3K8Bx%2r8Y7#xDh';
client.bind(() => {
  client.setBroadcast(true);
  send();
});
const devices = {};
client.on('message', (msg, rinfo) => {
  //rinfo.address;
  //rinfo.port;
  const message = JSON.parse(msg + '');
  console.log('message arrived: ', message);
  const decipherKey = (devices[message.cid] || {}).key || AES_GENERAL_KEY;
  const pack = decrypt(message, decipherKey);
  if (pack.t === 'dev') {
    // broadcast
    const device = {
      id: message.cid,
      name: pack.name,
      address: rinfo.address,
      port: rinfo.port,
      bound: false,
      props: {}
    };
    devices[device.id] = device;
    console.log('new device', device);
    const boundMessage = {
      mac: device.id,
      t: 'bind',
      uid: 0
    };
    const encryptedBoundMessage = encrypt(boundMessage, AES_GENERAL_KEY);
    const boundRequest = {
      cid: 'app',
      i: 1,
      t: 'pack',
      uid: 0,
      pack: encryptedBoundMessage
    };
    const toSend = new Buffer(JSON.stringify(boundRequest));
    client.send(toSend, 0, toSend.length, device.port, device.address);
    return;
  }
  if (pack.t === 'bindok') {
    if (!devices[message.cid]) {
      return;
    }
    const device = devices[message.cid];
    device.bound = true;
    device.key = pack.key;
    console.log('device is bound!', device);
    const statusMessage = {
      cols: ['Pow', 'Mod', 'SetTem', 'WdSpd', 'Air', 'Blo', 'Health', 'SwhSlp', 'Lig', 'SwingLfRig', 'SwUpDn', 'Quiet', 'Tur', 'StHt', 'TemUn', 'HeatCoolType', 'TemRec', 'SvSt'],
      mac: device.id,
      t: 'status'
    };
    const encryptedStatusMessage = encrypt(statusMessage, device.key);
    const statusRequest = {
      cid: 'app',
      i: 0,
      t: 'pack',
      uid: 0,
      pack: encryptedStatusMessage
    };
    const toSend = new Buffer(JSON.stringify(statusRequest));
    client.send(toSend, 0, toSend.length, device.port, device.address);
    return;
  }
  if (pack.t === 'dat') {
    if (!devices[message.cid]) {
      return;
    }
    const device = devices[message.cid];
    pack.cols.forEach((col, i) => {
      device.props[col] = pack.dat[i];
    });

    console.log('device status arrived', device);
    return;
  }
  
  console.log('unknown message %s', pack.t, message, pack);
});

function send() {
  const message = new Buffer(JSON.stringify({t: 'scan'}));
  client.send(message, 0, message.length, 7000, '192.168.1.255');
}

function decrypt(input, key = AES_GENERAL_KEY) {
  const decipher = crypto.createDecipheriv('aes-128-ecb', key, '');
  const str = decipher.update(input.pack, 'base64', 'utf8');
  const response = JSON.parse(str + decipher.final('utf8'));
  return response;
}
function encrypt(input, key = AES_GENERAL_KEY) {
  const cipher = crypto.createCipheriv('aes-128-ecb', key, '');
  const str = cipher.update(JSON.stringify(input), 'utf8', 'base64');
  const response = str + cipher.final('base64');
  return response;
}
/*

const stubMsg = { "t": "pack", "i": 1, "uid": 0, "cid": "f4911e053a74", "tcid": "", "pack": "LP24Ek0OaYogxs3iQLjL4E3Vt5mTh/fHEqLbpQgUfl1YT1PXPBDouOPiWHaG4G8lz22fUZtUbkblUYF5BzlKDV9xeQzMlsaP4RKBtrnsDrOW9q/1rcXqrgRRMRofA1j5I/Pa9syFI0kYFCUeBNxq44+UmYq4E5g5QzzU+6/Qd+SS7gg5WGiEL0fIVbZZaKC8ZtdFMALbzIQfSicO3KpLeXLpvz93fYRRHLTlg2ZgiozxOzEyvkoYentS0gpn4PfTzbbXHI8ghbocDlA7fUL03g==" }
console.log(decrypt(stubMsg));
*/
