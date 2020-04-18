import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
admin.initializeApp()

export const processScore = functions.https.onCall((data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    )
  }

  const [encryptedMeta] = data
  const secret = functions.config().score.secret
  const decryptedMeta = xor(encryptedMeta, secret)
  const gameImage = decryptedMeta.slice(10)
  const unencryptedScore = decryptedMeta.slice(0, 10)

  const { uid, token } = context.auth

  const score = parseInt(unencryptedScore)
  const cheater = Number.isNaN(score)

  const scoresRef = admin.firestore().collection('scores')

  let prevScore: any
  let displayName: string | undefined

  return (
    admin
      .auth()
      .getUser(uid)
      .then((result) => {
        displayName = result.displayName
        return scoresRef.doc(uid).get()
      })
      // @ts-ignore
      .then((scoreDoc) => {
        prevScore = scoreDoc.data()
        // Save score
        if (cheater || score > (prevScore?.score || 0)) {
          const newScore = {
            // Once a cheater, always a cheater
            cheater: prevScore?.cheater || cheater,
            score: Math.max(prevScore?.score || 0, score),
            uid,
            displayName,
            picture: token.picture,
            timestamp: admin.firestore.Timestamp.now(),
            gameImage,
          }
          return scoresRef.doc(uid).set(newScore)
        } else {
          return Promise.resolve()
        }
      })
      .then(() => Promise.resolve({ message: 'done' }))
  )
})

function xor(text: string, key: string) {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}
