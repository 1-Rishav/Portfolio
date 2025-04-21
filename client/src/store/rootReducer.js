import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.jsx';
// Add other reducers as needed

const rootReducer = combineReducers({
  auth: authReducer,
  // otherReducer: ...
});

export default rootReducer;