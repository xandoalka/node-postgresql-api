const admin = require('firebase-admin');
const { Buffer } = require('buffer');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  throw new Error('The GOOGLE_APPLICATION_CREDENTIALS_BASE64 environment variable was not found!');
}

const serviceAccount = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'xanzu-0912.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports = bucket;
