import axios from './axios'

export const getChats = async () => {
    return axios
        .get('/chat')
        .then(res => res.data.data)
        .catch(error => {
            if (error.status !== 200) throw error
        })
}

export const getChat = async id => {
    return axios
        .get(`/chat/${id}`)
        .then(res => res.data.data)
        .catch(error => {
            if (error.status !== 200) throw error
        })
}

export const getMessages = async id => {
    return axios
        .get(`/chat/${id}`)
        .then(res => res.data.data.messages)
        .catch(error => {
            if (error.status !== 200) throw error
        })
}

export const deleteChat = async id => {
    return axios
        .delete(`/chat/${id}`)
        .then(res => res.data)
        .catch(error => {
            if (error.status !== 200) throw error
        })
}

export const postChat = async () => {
    return axios
        .post(`/chat`)
        .then(res => res.data.data)
        .catch(error => {
            if (error.status !== 201) throw error
        })
}

export const putChat = async (id, chat) => {
    return axios
        .put(`/chat/${id}`, chat)
        .then(res => res.data.data)
        .catch(error => {
            if (error.status !== 200) throw error
        })
}

export const postMessage = async (id, message) => {
    return axios
        .post(`/chat/${id}/message`, message)
        .then(res => res.data.data)
        .catch(error => {
            if (error.status !== 200) throw error
        })
}
