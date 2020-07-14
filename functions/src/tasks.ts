import * as admin from "firebase-admin";

import { POSSIBLE_STATUSES, Task } from "./models";
import { isEmpty, messages } from "./utils";

const db = admin.firestore();

// TODO: 1. update status
//       2. remove task
//       3. get tasks count by status

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
        summary,
        description,
        status
    };

    const errors = <any>{};

    if (isEmpty(project_key)) {
        errors.project_key = messages.required;
    }

    if (isEmpty(reporter)) {
        errors.reporter = messages.required;
    }

    if (isEmpty(summary)) {
        errors.summary = messages.required;
    }

    if (!Object.keys(errors).length) {
        return res.status(400).json(errors);
    }

    try {
        const data = await db.collection('tasks').add(newTask);
        return res.json({ message: `task ${data.id} created successfully` });
    } catch (err) {
        console.log('Error adding project: ', err);
        return res.status(500).json(err);
    }
});

export const updateTaskStatus = (async (req: any, res: any): Promise<any> => {
    const { body, params } = req;
    const { status } = body;
    const { taskKey } = params;

    if (!status || !POSSIBLE_STATUSES.includes(status)) {
        const message = { error: 'Impossible status' };
        return res.status(404).json(message);
    }

    try {
        const taskToUpdate = db.doc(`tasks/${taskKey}`);
        const taskToUpdateExists = (await taskToUpdate.get()).exists;

        if (!taskToUpdateExists) {
            const message = { error: 'Task not found' };
            return res.status(404).json(message);
        }

        await taskToUpdate.update({ status });
        return res.status(200).json({ message: `Status updated to ${status} the task ${taskKey}`});
    } catch (err) {
        console.log('Error adding project: ', err);
        return res.status(500).json(err);
    }
});