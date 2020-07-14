import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { Project } from "./models";

const db = admin.firestore();

// TODO 1. validation callable function:
//  key/name create depend on name and check for unique (A project with that key/name already exists)
//  call on the client to allow or forbid creation +
//  2. implement remove project

const isPropertyExists = async (property: string, value: string): Promise<null | string> => {
    const projects = await db.collection('projects').where(property, '==', value).get();

    return projects.empty ? null : `A project with that ${property} already exists`;
};

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
    const { name, lead, key } = body;
    const newProject = <Project>{ name, lead, key };

    const errors = <any>{};

    if (!!isPropertyExists('key', key)) {
        errors.key = isPropertyExists('key', key);
    }

    if (!!isPropertyExists(name, 'name')) {
        errors.name = isPropertyExists('name', name);
    }

    if (!Object.keys(errors).length) {
        return res.status(400).json(errors);
    }

    try {
        const data = await db.collection('projects').add(newProject);
        return res.json({ message: `project ${data.id} created successfully` });
    } catch (err) {
        console.log('Error adding project: ', err);
        return res.status(500).json(err);
    }
});

export const removeProject = (async (req: any, res: any): Promise<any> => {
    const message = { error: 'Project not found' };
    if (!req.params || !req.params.projectKey) {
        return res.status(404).json(message);
    }
    const projectKey = req.params.projectKey;

    try {
        const projectToRemove = db.doc(`projects/${projectKey}`);
        const projectToRemoveExists = (await projectToRemove.get()).exists;

        if (!projectToRemoveExists) {
            return res.status(404).json(message);
        }

        await projectToRemove.delete();
        return res.status(200).json({ message: `Project was successfully deleted!`});
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

exports.validateProjectsProperties = functions
    .runWith({
        timeoutSeconds: 540,
        memory: '256MB'
    })
    .https.onCall(async (data: any, context): Promise<null | string> => {
        const { property, value } = data;
        return isPropertyExists(property, value);
    });