import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as firebase from "firebase";

import { auth } from "./auth";
import { firebaseConfig } from "./fb-config";

// todo: after client will work: separate validation parts if necessary

try {
    admin.initializeApp({
        credential: admin.credential.cert(auth),
        databaseURL: "https://jira-react-53875.firebaseio.com"
    });
} catch (e) { }

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const app = express();

import { getProjects, createProject, removeProject } from "./projects";
import { getTasks, createTask, updateTaskStatus, getTasksCountByStatus, removeTask } from "./tasks";
import { getUsers } from "./users";
import { signUp, logIn } from "./authentication";

const FBAuth = (async (req: any, res: any, next: any) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        return res.status(403).json({ error: 'Unauthorized'});
    }

    try {
        const decToken = await admin.auth().verifyIdToken(idToken);
        req.user = decToken;
        return next();
    } catch (e) {
        console.error('Error while verifying token ', e);
        return res.json(403).json(e);
    }
});

app.post('/signup', signUp);
app.post('/login', logIn);

app.get('/projects', FBAuth, getProjects);
app.post('/project', FBAuth, createProject);
app.delete('/project/:projectKey', FBAuth, removeProject);

app.get('/tasks', FBAuth, getTasks);
app.get('/tasks/:projectKey/:status', FBAuth, getTasksCountByStatus);
app.post('/task', FBAuth, createTask);
app.patch('/task/:taskKey', FBAuth, updateTaskStatus);
app.delete('/task/:taskKey', FBAuth, removeTask);

app.get('/users', FBAuth, getUsers);

// app.post('/user/image', uploadImage);


exports.api = functions.https.onRequest(app);

