import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as firebase from "firebase";

import { auth } from "./auth";
import { Project, Task, User } from "./models";

try {
    admin.initializeApp({
        credential: admin.credential.cert(auth),
        databaseURL: "https://jira-react-53875.firebaseio.com"
    });
} catch (e) { }

const firebaseConfig = {
    apiKey: "AIzaSyB_ZCaUvNQ-XnflKdzxMSS4HNuowR7rf4o",
    authDomain: "jira-react-53875.firebaseapp.com",
    databaseURL: "https://jira-react-53875.firebaseio.com",
    projectId: "jira-react-53875",
    storageBucket: "jira-react-53875.appspot.com",
    messagingSenderId: "274036535540",
    appId: "1:274036535540:web:b8bd7e1a60a471f2382ea1",
    measurementId: "G-H8NQQRFPED"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();
const app = express();

app.get('/projects', (async (request, response): Promise<any> => {
    try {
        const snapshot = await db.collection('projects').get();
        const sh: FirebaseFirestore.DocumentData[] = [];
        snapshot.forEach((doc) => {
            sh.push(doc.data());
        });
        return response.json(sh);
    } catch (err) {
        console.log('Error getting projects', err);
    }
}));

app.post('/project', (async(request, responce): Promise<any> => {
    const { body } = request;
    const { name, lead } = body;
    const newProject = <Project>{ name, lead };

    try {
        const data = await db.collection('projects').add(newProject);
        responce.json({ message: `project ${data.id} created successfully` });
    } catch (err) {
        console.log('Error adding project: ', err);
    }
}));

app.get('/tasks', (async(request, response): Promise<any> => {
    try {
        const snapshot = await db.collection('tasks').get();
        const sh: FirebaseFirestore.DocumentData[] = [];
        snapshot.forEach((doc) => {
            sh.push(doc.data());
        });
        return response.json(sh);
    } catch (err) {
        console.log('Error getting tasks:', err);
    }
}));

app.post('/task', (async(request, responce): Promise<any> => {
    const { body } = request;
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
        responce.json({ message: `task ${data.id} created successfully` });
    } catch (err) {
        console.log('Error adding project: ', err);
    }
}));

app.get('/users', (async(request, response): Promise<any> => {
    try {
        const snapshot = await db.collection('users').get();
        const sh: FirebaseFirestore.DocumentData[] = [];
        snapshot.forEach((doc) => {
            sh.push(doc.data());
        });
        return response.json(sh);
    } catch (err) {
        console.log('Error getting users', err);
    }
}));

const isEmpty = (str: string): boolean => str.trim() === '';
const isEmail = (email: string): boolean => {
    const regEx = "(?:[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])";
    return !!email.match(regEx);
};

// signup route
let token = null;
app.post('/signup', (async(req, res) => {
    const { body } = req;
    const newUser = <User>{
        full_name: body.full_name,
        email: body.email,
    };

    let errors = <any>{};

    if (isEmpty(newUser.full_name)) {
        errors.full_name = 'Must not be empty';
    }

    if(isEmpty(newUser.email)) {
        errors.email = 'Must not be empty';
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address';
    }

    if (isEmpty(body.password)) {
        errors.password = 'Must not be empty';
    }

    if (body.password !== body.confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    }

    if (Object.keys(errors).length) {
        return res.status(400).json(errors);
    }

    try {
        const data = await firebase.auth().createUserWithEmailAndPassword(newUser.email, body.password);
        const userId = data.user?.uid;
        token = await data.user?.getIdToken();
        const createdUser = <User>{
            ...newUser,
            userId
        };
        await db.collection('users').add(createdUser);
        return res.status(201).json(token);
    } catch (err) {
        return res.status(500).json(`error, user doesn\'t created, check your data and try again later - ${err}`);
    }
    return;
}));

exports.api = functions.https.onRequest(app);