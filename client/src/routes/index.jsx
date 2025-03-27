import {Navigate , useRoutes} from 'react-router-dom'

import NavLayout from '../layout/navLayout'
import Main from '../pages/main/Main'
import Mern_Highlights from '../pages/ScreenNav/Mern_HighlightsPage'
import Pern_Highlights from '../pages/ScreenNav/Pern_HighlightsPage'
import Develop_Service from '../pages/ScreenNav/Develop_ServicePage'
import Design_Service from '../pages/ScreenNav/DesignServicePage'
import AssignProject from '../pages/ScreenNav/AssignProjectPage'
import About from '../pages/ScreenNav/AboutPage'
import Contact from '../pages/ScreenNav/ContactPage'
import Labs from '../pages/ScreenNav/LabsPage'
import Mobile_Highlights from '../pages/MobileNav/HighlightsPage'
import Mobile_Service from '../pages/MobileNav/ServicesPage';

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
                { path: "*", element: <Navigate to="/404" replace /> }
            ]
        }
    ])
}