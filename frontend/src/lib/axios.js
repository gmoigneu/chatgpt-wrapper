import Axios from 'axios'

export const getApiURL = () => {

    if(window.location.hostname === 'frontend.sf.test') {
        return('http://api.sf.test:8000')
    } else {
        return window.location.origin.replace('frontend', 'api')
    }
}


let entrypoint = getApiURL()
if(!entrypoint) {
    entrypoint = 'localhost'
}

const axios = Axios.create({
    baseURL: entrypoint,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
    },
})
export default axios