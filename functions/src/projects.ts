import * as admin from "firebase-admin";

import { Project } from "./models";

const db = admin.firestore();

export const getProjects = (async (req: any, res: any): Promise<any> => {
    try {
        const snapshot = await db.collection('projects').get();
        const sh: FirebaseFirestore.DocumentData[] = [];
        snapshot.forEach((doc) => {
            sh.push(doc.data());
        });
        return res.json(sh);
    } catch (err) {
        console.log('Error getting projects', err);
    }
});

export const createProject = (async(req: any, res: any): Promise<any> => {
    const { body } = req;
    const { name, lead } = body;
    const newProject = <Project>{ name, lead };

    try {
        const data = await db.collection('projects').add(newProject);
        res.json({ message: `project ${data.id} created successfully` });
    } catch (err) {
        console.log('Error adding project: ', err);
    }
});