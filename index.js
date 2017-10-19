const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const crypto = require('crypto');

client.bind(() => {
  client.setBroadcast(true);
  send();
});
client.on('message', (msg) => {
  console.log(decrypt(JSON.parse(msg + '')));
});

function send() {
  const message = new Buffer(JSON.stringify({t: 'scan'}));
  client.send(message, 0, message.length, 7000, '192.168.1.255');
}

function decrypt(input) {
  const decipher = crypto.createDecipheriv('aes-128-ecb', 'a3K8Bx%2r8Y7#xDh', '');
  const str = decipher.update(input.pack, 'base64', 'utf8');
  const response = JSON.parse(str + decipher.final('utf8'));
  return response;
}
/*

const stubMsg = { "t": "pack", "i": 1, "uid": 0, "cid": "f4911e053a74", "tcid": "", "pack": "LP24Ek0OaYogxs3iQLjL4E3Vt5mTh/fHEqLbpQgUfl1YT1PXPBDouOPiWHaG4G8lz22fUZtUbkblUYF5BzlKDV9xeQzMlsaP4RKBtrnsDrOW9q/1rcXqrgRRMRofA1j5I/Pa9syFI0kYFCUeBNxq44+UmYq4E5g5QzzU+6/Qd+SS7gg5WGiEL0fIVbZZaKC8ZtdFMALbzIQfSicO3KpLeXLpvz93fYRRHLTlg2ZgiozxOzEyvkoYentS0gpn4PfTzbbXHI8ghbocDlA7fUL03g==" }
console.log(decrypt(stubMsg));
*/
