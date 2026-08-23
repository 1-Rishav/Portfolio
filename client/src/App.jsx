import './App.css'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import Router from './routes/index';
import { CheckAuth } from './store/slices/authSlice';

const App=()=> {
  const dispatch = useDispatch();

  // Persisted (localStorage) isLoggedIn/role is only ever a UI hint - this
  // confirms it against the real session cookie once on load and corrects
  // it if the cookie is missing/expired.
  useEffect(() => {
    dispatch(CheckAuth());
  }, [dispatch]);

  return (
    <>
      
     <Router/>
     
    </>
  )
}

export default App
