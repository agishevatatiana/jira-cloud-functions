import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as firebase from "firebase";

import { auth } from "./auth";
import { firebaseConfig } from "./fb-config";

try {
    admin.initializeApp({
        credential: admin.credential.cert(auth),
        databaseURL: "https://jira-react-53875.firebaseio.com"
    });
} catch (e) { }

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const app = express();

import { getProjects, createProject } from "./projects";
import { getTasks, createTask } from "./tasks";
import { getUsers } from "./users";
import { signUp, logIn } from "./authentication";

app.get('/projects', getProjects);
app.post('/project', createProject);
app.get('/tasks', getTasks);
app.post('/task', createTask);
app.get('/users', getUsers);
app.post('/signup', signUp);
app.post('/login', logIn);

exports.api = functions.https.onRequest(app);

