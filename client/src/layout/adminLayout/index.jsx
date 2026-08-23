import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom"

const AdminLayout = () => {

    const {isLoggedIn,role}=useSelector(state=>state.auth);

    // Real, enforced guard (this used to be commented out, so anyone could
    // reach /admin/* by typing the URL). The backend independently enforces
    // this too - this is a UX redirect, not the actual security boundary.
    if(!isLoggedIn || role!=="admin"){
        return <Navigate to="/" replace/>
    }

  return (
    <>
    <Outlet/>
    </>
  )
}

export default AdminLayout