import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
const CryptoJS = require('crypto-js')
admin.initializeApp()

export const processScore = functions.https.onCall((data, context) => {
  if (!context.auth || !context.auth.uid) return

  const { score } = data
  const secret = functions.config().score.secret

  const bytes = CryptoJS.AES.decrypt(score, secret)
  const originalScore = parseInt(bytes.toString(CryptoJS.enc.Utf8))

  return admin
    .firestore()
    .collection('users')
    .doc(context.auth.uid)
    .update({
      topScore: {
        score: originalScore,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      },
    })
})
