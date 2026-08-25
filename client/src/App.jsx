import './App.css'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'

import Router from './routes/index';
import { CheckAuth } from './store/slices/authSlice';

// Undefined until VITE_GOOGLE_CLIENT_ID is set in client/.env (see .env.example).
// Without it, the provider simply isn't mounted and the Google button in
// AuthModal doesn't render - everything else works exactly as before.
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const App=()=> {
  const dispatch = useDispatch();

  // Persisted (localStorage) isLoggedIn/role is only ever a UI hint - this
  // confirms it against the real session cookie once on load and corrects
  // it if the cookie is missing/expired.
  useEffect(() => {
    dispatch(CheckAuth());
  }, [dispatch]);

  const app = <Router/>

  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {app}
    </GoogleOAuthProvider>
  ) : app
}

export default App
