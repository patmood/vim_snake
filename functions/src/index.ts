import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
admin.initializeApp()

export const processScore = functions.https.onCall((data, context) => {
  if (!context.auth || !context.auth.uid) return

  const secret = functions.config().score.secret
  const unencryptedScore = xor(data, secret)
  const originalScore = parseInt(unencryptedScore)

  const cheater = Number.isNaN(originalScore)

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

function xor(text: string, key: string) {
  var result = ''

  for (var i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}
