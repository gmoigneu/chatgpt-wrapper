import Axios from 'axios'
const axios = Axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
    },
})
export default axios