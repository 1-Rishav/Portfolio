import { createSlice } from "@reduxjs/toolkit";
import {toast} from 'react-toastify';
import axios from '../../utils/axios'
import { persistor } from "../index";
const initialState = {
    isLoggedIn:false,
    role:'user',
    token:null
}
const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        logIn(state,action){
            state.isLoggedIn=action.payload.isLoggedIn;
            state.role = action.payload.role;
            state.token = action.payload.token
        },
        logOut(state,action){
            state.isLoggedIn=false;
            state.role="user";
            state.token=null
        }
    }
})

 const authAction = authSlice.actions;
 export default authSlice.reducer;

 export function LoginUser(formValues){
    return async(dispatch,getState)=>{
        try {
            const response = await axios.post('auth/login',formValues,{ withCredentials:true});
            const {token , role,message}=response.data;

            dispatch(
                authAction.logIn({
                    isLoggedIn:true,
                    role,
                    token
                })
            )
      toast.success(message)
            return response.status;
        } catch (error) {
            toast.error(error.message)
        }
    }
 }

 export function RegisterUser(formValues){
    return async(dispatch , getState)=>{
        try {
            const response = await axios.post('auth/register',formValues,{ withCredentials:true});
            const {token , role , message}=response.data;
            dispatch(
                authAction.logIn({
                    isLoggedIn:true,
                    role,
                    token
                })
            )
        toast.success(message)
        } catch (error) {
            toast.error(error.message)
        }
    }
 }

 export function LogOut(){
    return async(dispatch , getState)=>{
        try {
    dispatch(authAction.logOut());
    persistor.purge();
        } catch (error) {
            console.log(error)
            toast.error(error.message);
        }
    }
 }