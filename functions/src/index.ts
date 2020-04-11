import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
admin.initializeApp()

export const processScore = functions.https.onCall((data, context) => {
  if (!context.auth || !context.auth.uid) return

  const { uid } = context.auth
  const secret = functions.config().score.secret
  const unencryptedScore = xor(data, secret)
  const score = parseInt(unencryptedScore)

  const cheater = Number.isNaN(score)

  const cheatersRef = admin.firestore().collection('cheaters')
  const scoresRef = admin.firestore().collection('scores')
  const usersRef = admin.firestore().collection('users')

  if (cheater) {
    return cheatersRef.doc(uid).set({ cheater, data })
  }

  return scoresRef
    .doc()
    .set({
      userUid: uid,
      score: score,
    })
    .then((_: any) => {
      return usersRef.doc(uid).update({
        topScore: {
          score,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        },
      })
    })
})

function xor(text: string, key: string) {
  var result = ''

  for (var i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}
