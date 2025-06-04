import * as admin from 'firebase-admin'

import { env } from './env'

const privateKey = Buffer.from(env.ADMIN_PRIVATE_KEY ?? '', 'base64').toString(
  'ascii'
)

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.ADMIN_PROJECT_ID,
    clientEmail: env.ADMIN_CLIENT_EMAIL,
    privateKey
  }),
  storageBucket: env.STORAGE_BUCKET
})

export const firebaseAdmin = admin
export const storage = admin.storage().bucket()
export const firestoreStorage = admin.storage()
