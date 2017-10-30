const dgram = require('dgram');
const internalIp = require('internal-ip');
const client = dgram.createSocket('udp4');
const AES_GENERAL_KEY = 'a3K8Bx%2r8Y7#xDh';
const ip = internalIp.v4.sync();
client.on('message', buff => {
  const msg = JSON.parse(buff + '');
  console.log('' + msg);

  {
    t: 'pack',
      i: 1,
        uid: 0,
          cid: 'f4911e053a74',
            tcid: '',
              pack: 'LP24Ek0OaYogxs3iQLjL4E3Vt5mTh/fHEqLbpQgUfl1YT1PXPBDouOPiWHaG4G8lz22fUZtUbkblUYF5BzlKDV9xeQzMlsaP4RKBtrnsDrOW9q/1rcXqrgRRMRofA1j5I/Pa9syFI0kYFCUeBNxq44+UmYq4E5g5QzzU+6/Qd+SS7gg5WGiEL0fIVbZZaKC8ZtdFMALbzIQfSicO3KpLeXLpvz93fYRRHLTlg2ZgiozxOzEyvkoYentS0gpn4PfTzbbXHI8ghbocDlA7fUL03g=='
  }
});
client.bind(7000);


function encrypt(input, key = AES_GENERAL_KEY) {
  const cipher = crypto.createCipheriv('aes-128-ecb', key, '');
  const str = cipher.update(JSON.stringify(input), 'utf8', 'base64');
  const response = str + cipher.final('base64');
  return response;
}

function decrypt(input, key = AES_GENERAL_KEY) {
  const decipher = crypto.createDecipheriv('aes-128-ecb', key, '');
  const str = decipher.update(input.pack, 'base64', 'utf8');
  const response = JSON.parse(str + decipher.final('utf8'));
  return response;
}