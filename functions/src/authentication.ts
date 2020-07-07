import * as admin from "firebase-admin";
import * as firebase from "firebase";

import { User } from "./models";

const db = admin.firestore();

const isEmpty = (str: string): boolean => str.trim() === '';
const isEmail = (email: string): boolean => {
    const regEx = "(?:[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])";
    return !!email.match(regEx);
};

let token = null;
export const signUp = (async(req: any, res: any) => {
    const { body } = req;
    const newUser = <User>{
        full_name: body.full_name,
        email: body.email,
    };

    const errors = <any>{};

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
});

export const logIn = (async(req: any, res: any) => {
    const { body } = req;
    const { email, password } = body;

    const errors = <any>{};

    if(isEmpty(email)) {
        errors.email = 'Must not be empty';
    } else if (!isEmail(email)) {
        errors.email = 'Must be a valid email address';
    }

    if (isEmpty(password)) {
        errors.password = 'Must not be empty';
    }

    if (Object.keys(errors).length) {
        return res.status(400).json(errors);
    }

    try {
        const data = await firebase.auth().signInWithEmailAndPassword(email, password);
        token = await data.user?.getIdToken();
        return res.json(token);
    } catch (e) {
        console.log(e);
        return res.json(500).json( { message: e.statusText });
    }
});