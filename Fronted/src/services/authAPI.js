import api from "../services/api"; 

export const authAPI = {
    // register new user
    register: async (userData) => {
        const response = await api.post('/auth/register/', userData)
        return response.data;
    },

    // login
    login: async (credentials) => {
        const response = await api.post('/auth/login/', credentials)
        const {access, refresh} = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        return response.data;
    },

    // logout
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token')
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile/');
        return response.data;
    },

    updateProfile: async(profileData) => {
        const response = await api.patch('/auth/profile/', profileData);
        return response.data;
    },
}