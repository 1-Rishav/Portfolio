import { createSlice } from "@reduxjs/toolkit";
import {toast} from 'react-toastify';
import axios from '../../utils/axios'
import { persistor } from "../index";

// NOTE: the raw JWT is intentionally NOT kept here anymore. The httpOnly
// cookie is the real source of truth for the session; this slice only tracks
// isLoggedIn/role/firstName/email (all safe to persist - no credentials) for
// driving the UI. CheckAuth() re-syncs these against the backend on app load
// so persisted (localStorage) state can never grant access on its own - the
// server always has the final say.
const initialState = {
    isLoggedIn:false,
    role:'user',
    firstName:'',
    email:'',
}
const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        logIn(state,action){
            state.isLoggedIn=true;
            state.role = action.payload.role;
            state.firstName = action.payload.firstName ?? state.firstName;
            state.email = action.payload.email ?? state.email;
        },
        logOut(state){
            state.isLoggedIn=false;
            state.role="user";
            state.firstName='';
            state.email='';
        }
    }
})

 const authAction = authSlice.actions;
 export default authSlice.reducer;

 export function LoginUser(formValues){
    return async(dispatch)=>{
        try {
            const response = await axios.post('auth/login',formValues);
            const {role,message,firstName,email}=response.data;

            dispatch(authAction.logIn({role,firstName,email}))
            toast.success(message)
            return {success:true, role};
        } catch (error) {
            toast.error(error?.message || 'Login failed. Please check your credentials.')
            return {success:false};
        }
    }
 }

 export function RegisterUser(formValues){
    return async(dispatch)=>{
        try {
            const response = await axios.post('auth/register',formValues);
            const {role,message,firstName,email}=response.data;
            dispatch(authAction.logIn({role,firstName,email}))
            toast.success(message)
            return {success:true, role};
        } catch (error) {
            toast.error(error?.message || 'Registration failed. Please try again.')
            return {success:false};
        }
    }
 }

 // Verifies a Google ID token server-side and logs the person in exactly like
 // email/password - same reducer action, same {success, role} contract - so
 // every existing gate (Assign Project modal, admin auto-redirect) keeps
 // working unchanged regardless of which method was used to sign in.
 export function GoogleAuth(credential){
    return async(dispatch)=>{
        try {
            const response = await axios.post('auth/google',{credential});
            const {role,message,firstName,email}=response.data;
            dispatch(authAction.logIn({role,firstName,email}))
            toast.success(message)
            return {success:true, role};
        } catch (error) {
            toast.error(error?.message || 'Google sign-in failed. Please try again.')
            return {success:false};
        }
    }
 }

 // Verifies the existing session cookie (if any) against the backend. Called
 // once on app load so a stale/expired persisted "isLoggedIn" never lies to
 // the UI about access it doesn't actually have.
 export function CheckAuth(){
    return async(dispatch)=>{
        try {
            const response = await axios.get('auth/me');
            const {role,firstName,email} = response.data.user;
            dispatch(authAction.logIn({role,firstName,email}))
        } catch {
            dispatch(authAction.logOut());
        }
    }
 }

 export function LogOut(){
    return async(dispatch)=>{
        try {
            await axios.post('auth/logout');
        } catch {
            // Even if the network call fails, still clear local state below -
            // the person clicked logout and expects it to take effect locally.
        }
        dispatch(authAction.logOut());
        persistor.purge();
    }
 }
