import axios from 'axios'

// Defaults to the deployed production API so the live site keeps working with
// zero configuration. For local development, copy .env.example to .env and
// set VITE_API_BASE_URL to your local server (e.g. http://localhost:3001/) -
// this replaces manually commenting/uncommenting a hardcoded URL by hand,
// which is what the repeated "update BASE_URL" commits in the project
// history were working around.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://portfolio-0nkn.onrender.com/'

const axiosInstance = axios.create({baseURL: BASE_URL, withCredentials: true})

axiosInstance.interceptors.response.use((response) => response,
(error)=>Promise.reject(error.response ? error.response.data : { message: 'Network error. Please check your connection and try again.' })
)

export default axiosInstance;