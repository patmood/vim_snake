import * as firebaseCore from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAGjolOOMybJWkMzNwWanw-Z7In_V40hj0',
  authDomain: 'vimsnake.firebaseapp.com',
  databaseURL: 'https://vimsnake.firebaseio.com',
  projectId: 'vimsnake',
  storageBucket: 'vimsnake.appspot.com',
  messagingSenderId: '833172946837',
  appId: '1:833172946837:web:7774a887200d1b7c8e409c',
  measurementId: 'G-4VN1YPMY22',
}

// Initialize Firebase
firebaseCore.initializeApp(firebaseConfig)

export const firebase = firebaseCore
export const db = firebaseCore.firestore()
