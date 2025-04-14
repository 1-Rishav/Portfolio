import axios from 'axios'

const BASE_URL = 'https://portfolio-z306.onrender.com/' /* 'http://localhost:3001/' */

const axiosInstance = axios.create({baseURL: BASE_URL})

axiosInstance.interceptors.response.use((response) => response,
(error)=>Promise.reject((error.response && error.response.data))
)

export default axiosInstance;