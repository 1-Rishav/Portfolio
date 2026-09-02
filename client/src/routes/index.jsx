import {Suspense,lazy} from "react";
import {Navigate , useRoutes} from 'react-router-dom'

import NavLayout from '../layout/navLayout'
import LoadingHome from '../components/Form_&_Features/LoadingHome'
import AdminLayout from "../layout/adminLayout";

const Loadable = (Component) => (props) => {
    return (
      <Suspense fallback={<LoadingHome/>}>
        <Component {...props} />
      </Suspense>
    );
  };
export default function Router(){
    return useRoutes([
        {
            path:'/',
            element:<NavLayout/>,
            children:[
                 //{ element: <Navigate to="/" replace />, index: true },
                 {path:'/',element:<Main/>},
                {path: 'develop-services',element:<Develop_Service/>},
                {path: 'design-services',element:<Design_Service/>},
                {path: 'mern-highlights',element:<Mern_Highlights/>},
                {path: 'pern-highlights',element:<Pern_Highlights/>},
                {path: 'about',element:<About/>},
                {path: 'Contact',element:<Contact/>},
                {path: 'tech_lab',element:<Labs/>},
                {path: 'assign-project',element:<AssignProject/>},
                {path: 'highlights',element:<Mobile_Highlights/>},
                {path: 'services',element:<Mobile_Service/>},
                {path: '404',element:<NotFound/>},
                { path: "*", element: <Navigate to="/404" replace /> }
            ]
        },
        
        {
          path:'/admin',
          element:<AdminLayout/>,
          children:[
            {element: <Navigate to="/admin/menu" replace/>,index:true},
            {path:'menu',element:<Main/>},
            {path:'connections',element:<Connections/>},
            {path:'assignedProjects',element:<AssignedProjects/>}
          ]
        },
        
    ])
}

// Every page-level route is code-split (lazy-loaded) so the initial bundle
// only ships what a given page actually needs, instead of all 14 at once.
// NavLayout/AdminLayout stay eager above since they're the immediate chrome
// every route needs regardless of which page loads inside it.
const Main = Loadable(lazy(()=> import ("../pages/main/Main")))
const Mern_Highlights = Loadable(lazy(()=> import('../pages/ScreenNav/Mern_HighlightsPage')))
const Pern_Highlights = Loadable(lazy(()=> import('../pages/ScreenNav/Pern_HighlightsPage')))
const Develop_Service = Loadable(lazy(()=> import('../pages/ScreenNav/Develop_ServicePage')))
const Design_Service = Loadable(lazy(()=> import('../pages/ScreenNav/DesignServicePage')))
const AssignProject = Loadable(lazy(()=> import('../pages/ScreenNav/AssignProjectPage')))
const About = Loadable(lazy(()=> import('../pages/ScreenNav/AboutPage')))
const Contact = Loadable(lazy(()=> import('../pages/ScreenNav/ContactPage')))
const Labs = Loadable(lazy(()=> import('../pages/ScreenNav/LabsPage')))
const Mobile_Highlights = Loadable(lazy(()=> import('../pages/MobileNav/HighlightsPage')))
const Mobile_Service = Loadable(lazy(()=> import('../pages/MobileNav/ServicesPage')))
const NotFound = Loadable(lazy(()=> import('../pages/NotFoundPage')))
const AssignedProjects = Loadable(lazy(()=> import('../pages/AdminNav/AssignedProjectsPage')))
const Connections = Loadable(lazy(()=> import('../pages/AdminNav/ConnectionsPage')))
