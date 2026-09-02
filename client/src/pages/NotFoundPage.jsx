import { Link } from 'react-router-dom'

// Rendered at /404, which the router's wildcard route redirects any
// unmatched URL to. Previously that redirect pointed at a path with no
// matching route at all, so landing here just hit the same wildcard again.
function NotFound() {
  return (
    <div className='relative pt-14 pb-10 | lg:pt-28 lg:pb-16 | xl:pt-32 flex flex-col items-center justify-center xl:px-20 lg:px-14 md:px-10 max-md:px-5 h-full w-full text-center'>
      <p className='text-2xl | lg:text-4xl font-sans-primary tracking-tight text-gray-400 dark:text-grayDark-400 mb-2'>
        404
      </p>
      <h1 className='text-4xl | md:text-6xl | xl:text-7xl font-sans-primary tracking-tight text-black dark:text-grayDark-100 font-semibold mb-6'>
        Page not found
      </h1>
      <p className='text-base | lg:text-lg text-gray-600 dark:text-grayDark-200 font-sans-primary max-w-md mb-10'>
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to='/'
        className='inline-flex items-center justify-center rounded-full bg-emerald-300 hover:bg-emerald-400 transition-colors text-black font-medium py-2.5 px-6'
      >
        Back to home
      </Link>
    </div>
  )
}

export default NotFound
