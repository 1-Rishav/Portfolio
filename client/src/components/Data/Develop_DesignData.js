// 4.4: restructured from 4 flat {id,service}[] arrays into 4 objects bundling heading/subheading/accentChar
// alongside services - matching serviceGroup's schema exactly (the schema's own comment: these "travel
// together as one editorial unit, not as a floating list plus a disconnected heading"). `services` is now
// plain strings, same as the schema's field; Develop_Service.jsx/Design_Service.jsx build the {id,service}
// pairs FeatureComponent expects at render time, the same way for fallback data and real Sanity data alike.
export const develop = {
    heading: 'Develop',
    subheading: 'I am passionate about building web solutions that align with your unique business goals. Let’s collaborate to bring your ideas to life and create something impactful together ',
    accentChar: '.',
    services: [
        'Frontend Development',
        'Backend Development',
        'Database Management',
        'Deployment',
        'Consultation Services',
    ],
}

export const support = {
    heading: 'Support',
    subheading: 'I am passionate about building web solutions that align with your unique business goals. Let’s collaborate to bring your ideas to life and create something impactful together ',
    accentChar: '.',
    services: [
        'Web Hosting',
        'Bug fixing',
        'Performance optimization ',
        'Application updates',
        'Site Monitoring',
    ],
}

export const design = {
    heading: ' Design',
    subheading: 'As a web designer, I blend creativity with functionality to ensure that each website not only looks stunning but also performs seamlessly ',
    accentChar: '.',
    services: [
        'Custom Web Design',
        'UI/UX Design',
        'E-Commerce Design',
        'Responsive Design',
    ],
}

export const other = {
    heading: 'Other',
    subheading: 'I ensure that each project is cohesive, user-centric, and aligned with your brand’s goals.Let’s work together to design something extraordinary ',
    accentChar: '!',
    services: [
        'Design Updates',
        'Optimization',
        'SEO-Friendly Design',
        'Content Layout',
        'Web Strategy',
    ],
}
