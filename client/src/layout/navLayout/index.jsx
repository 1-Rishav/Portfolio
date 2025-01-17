
import { Navigate, Outlet } from "react-router-dom";
//import { useSelector } from "react-redux";


const NavLayout = () => {
  //const isLoggedIn = true;

  // {isLoggedIn &&  
  // <Navigate to='/'/>}
   
  
  return (
    <>
      <Outlet />
    </>
  );
};

export default NavLayout;
