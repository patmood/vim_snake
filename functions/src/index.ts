import * as functions from 'firebase-functions'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const saveScore = functions.https.onCall((data, context) => {
  const message = context.auth ? `Hello ${context.auth.uid}` : `hello world`
  return message
})
