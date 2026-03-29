const QRCode = require('qrcode');
const config = require('../config/config');

exports.generateQRCodeBuffer = async (certificateUrl) => {

  const qrBuffer = await QRCode.toBuffer(certificateUrl, {
    width: 300,
    margin: 2
  });

  return qrBuffer;
};
