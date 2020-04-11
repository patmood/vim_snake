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

  const [gameImage, encryptedScore] = data

  const { uid, token } = context.auth
  const secret = functions.config().score.secret
  const unencryptedScore = xor(encryptedScore, secret)
  const score = parseInt(unencryptedScore)

  let cheater = Number.isNaN(score)

  const cheatersRef = admin.firestore().collection('cheaters')
  const scoresRef = admin.firestore().collection('scores')

  let prevScore: any
  let username: any

  return (
    admin
      .auth()
      .getUser(uid)
      .then((result) => {
        username = result.displayName
        return scoresRef.doc(uid).get()
      })
      .then((doc) => {
        prevScore = doc.data()
        // Save cheaters
        if (cheater) {
          return cheatersRef.doc(uid).set({ cheater, encryptedScore, uid, username: token.name })
        }
        return Promise.resolve(prevScore)
      })
      // @ts-ignore
      .then(() => {
        // Save score
        if (!prevScore || prevScore.score < score) {
          const newScore = {
            // Once a cheater, always a cheater
            cheater: prevScore ? prevScore.cheater || cheater : cheater,
            score,
            uid,
            displayName: username,
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
