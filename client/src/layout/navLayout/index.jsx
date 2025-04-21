
import {  Navigate, Outlet,useLocation  } from "react-router-dom";
import { useEffect, useState } from 'react';
import LoadingBar from "../../components/Form_&_Features/LoadingBar";
import { useSelector } from "react-redux";
//import { useSelector } from "react-redux";


const UserLayout = () => {
  //const isLoggedIn = true;
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      // Predict if user is going back to "/"
      const nextUrl = document.referrer; // doesn't always work reliably, so:
      const path = window.location.pathname;
      if (path === '/') {
        setLoading(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  useEffect(() => {
    // Only trigger loading when landing on Main ("/")
    if (location.pathname === '/') {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1200); // match animation duration
      return () => clearTimeout(timer);
    } else {
      setLoading(false); // Ensure it's hidden elsewhere
    }
  }, [location.pathname]);
  
  // if(isLoggedIn){
  //  if(role==="admin"){
  //   return <Navigate to='/admin'/>
  //  }
  // }
  return (
    <>
    <LoadingBar loading={loading} />
    <div>
        <Outlet />
      </div>
    </>
  );
};

export default UserLayout;
