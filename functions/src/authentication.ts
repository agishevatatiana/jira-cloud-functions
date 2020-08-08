import * as admin from "firebase-admin";
import * as firebase from "firebase";

import { User } from "./models";
import { ValidationLogInFn, ValidationSugnUpFn } from "./utils";

const db = admin.firestore();



let token = null;
export const signUp = (async(req: any, res: any) => {
    const { body } = req;
    const newUser = <User>{
        full_name: body.full_name,
        email: body.email,
    };

    // validation for empty fields, email format and passwords compatibility
    ValidationSugnUpFn(body, res);

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

    // validation for empty fields, email format
    ValidationLogInFn(body, res);

    try {
        const data = await firebase.auth().signInWithEmailAndPassword(email, password);
        token = await data.user?.getIdToken();
        return res.json(token);
    } catch (e) {
        console.log('errors: ', e);
        return res.status(500).json(e);
    }
});