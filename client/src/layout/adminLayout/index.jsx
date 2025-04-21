import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom"

const AdminLayout = () => {

    const {isLoggedIn,role}=useSelector(state=>state.auth);
// if(!isLoggedIn){
//     if(role==="user"){
//         return <Navigate to="/"/>
//     }
//   }
  return (
    <>
    <Outlet/>
    </>
  )
}

export default AdminLayout