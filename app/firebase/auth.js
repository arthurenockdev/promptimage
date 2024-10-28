import { createUserWithEmailAndPassword,signInWithEmailAndPassword ,GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updatePassword, sendEmailVerification } from 'firebase/auth'
import {auth} from '../utils/firebaseConfig'
import { Result } from 'postcss';


export const doCreateUserWithEmailAndPassword = async(email, password)=>{
    return createUserWithEmailAndPassword(auth , email, password);

}

export const doSignInWithEmailAndPassword = async(email, password)=>{
    return signInWithEmailAndPassword(auth , email, password);

}


export const doSignInWithGoogle = async()=>{
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    //result.user

return result
}

export const doSignOut=()=>{
    return auth.signOut();

}

/*
export const doPasswordReset =(email)=>{
    return sendPasswordResetEmail(auth, email);
    
}

export const doPasswordChange= (password)=>{
    return updatePassword(auth.currentUser, password);
}

export const doEmailVerification=()=>{
    return sendEmailVerification(auth.currentUser,{
        url:'${window.location.origin}/dashboard',
    })
}

*/