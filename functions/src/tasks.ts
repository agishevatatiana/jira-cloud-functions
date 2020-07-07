import * as admin from "firebase-admin";

import { Task } from "./models";

const db = admin.firestore();

export const getTasks = (async(req: any, res: any): Promise<any> => {
    try {
        const snapshot = await db.collection('tasks').get();
        const sh: FirebaseFirestore.DocumentData[] = [];
        snapshot.forEach((doc) => {
            sh.push(doc.data());
        });
        return res.json(sh);
    } catch (err) {
        console.log('Error getting tasks:', err);
    }
});

export const createTask = (async(req: any, res: any): Promise<any> => {
    const { body } = req;
    const { project_key, reporter, description, status, summary } = body;
    const newTask = <Task>{
        project_key,
        reporter,
        description,
        status,
        summary
    };
    try {
        const data = await db.collection('tasks').add(newTask);
        res.json({ message: `task ${data.id} created successfully` });
    } catch (err) {
        console.log('Error adding project: ', err);
    }
});