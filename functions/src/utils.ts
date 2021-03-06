import { LogInUser, SignUpUser } from "./models";

export const messages = {
    required: 'Must not be empty'
};

const isEmail = (email: string): boolean => {
    const regEx = "(?:[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])";
    return !!email.match(regEx);
};

export const isEmpty = (str: string): boolean => str.trim() === '';

export const ValidationSugnUpFn = (
    { full_name, email, password, confirmPassword}: SignUpUser,
    res: any
): void => {
    const errors = <any>{};

    if (isEmpty(full_name)) {
        errors.full_name = messages.required;
    }

    if (isEmpty(email)) {
        errors.email = messages.required;
    } else if (!isEmail(email)) {
        errors.email = 'Must be a valid email address';
    }

    if (isEmpty(password)) {
        errors.password = messages.required;
    }

    if (isEmpty(confirmPassword)) {
        errors.confirmPassword = messages.required;
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    }

    if (Object.keys(errors).length) {
        return res.status(400).json(errors);
    }
};

export const ValidationLogInFn = ({ email, password }: LogInUser, res: any): void => {
    const errors = <any>{};

    if(isEmpty(email)) {
        errors.email = messages.required;
    } else if (!isEmail(email)) {
        errors.email = 'Must be a valid email address';
    }

    if (isEmpty(password)) {
        errors.password = messages.required;
    }

    if (Object.keys(errors).length) {
        return res.status(400).json(errors);
    }
};