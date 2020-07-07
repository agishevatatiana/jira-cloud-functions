import * as admin from "firebase-admin";

const db = admin.firestore();

export const getUsers = (async(req: any, res: any): Promise<any> => {
    try {
        const snapshot = await db.collection('users').get();
        const sh: FirebaseFirestore.DocumentData[] = [];
        snapshot.forEach((doc) => {
            sh.push(doc.data());
        });
        return res.json(sh);
    } catch (err) {
        console.log('Error getting users', err);
    }
});