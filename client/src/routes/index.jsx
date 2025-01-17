import {Navigate , useRoutes} from 'react-router-dom'

import NavLayout from '../layout/navLayout'
import Main from '../pages/main/Main'
import Mern_Highlights from '../pages/navPages/Mern_HighlightsPage'
import Pern_Highlights from '../pages/navPages/Pern_HighlightsPage'
import Develop_Service from '../pages/navPages/Develop_ServicePage'
import Design_Service from '../pages/navPages/DesignServicePage'
import AssignProject from '../pages/navPages/AssignProjectPage'
import About from '../pages/navPages/AboutPage'
import Contact from '../pages/navPages/ContactPage'

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
                {path: 'assign-project',element:<AssignProject/>},
                { path: "*", element: <Navigate to="/404" replace /> }
            ]
        }
    ])
}