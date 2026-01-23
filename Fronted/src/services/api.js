import axios from 'axios';

// Base URL for Django API
const API_BASE_URL = 'http://127.0.0.1:8000/api/'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type' : 'application/json',
    }
})

// Request interceptors to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If token expired, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh: refreshToken,
                })

                const {access} = response.data;
                localStorage.setItem('access_token', access);

                originalRequest.headers.Authorization = `Bearer ${access}`
                return api(originalRequest);
            } catch (error) {
                // refresh failed
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
)


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

export const API = {
    // get user's cart
    get: async () => {
        const response = await api.get('/cart/');
        return response.data;
    },

    // add items to cart
    addItem: async (productId, quantity = 1) => {
        const response = await api.post('/cart/add_item/', {
            product_id: productId,
            quantity: quantity,
        });
        return response.data;
    },

    // remove item from cart
    removeItem: async(itemId) => {
        const response = await api.delete('/cart/remove_item/', {
            params: {
                item_id:itemId,
            }
        })
        return response.data
    },

    // update cart
    updateItem: async(itemId, quantity) => {
        const response = await api.patch('/cart/update_item', {
            item_id:itemId,
            quantity: quantity,
        });
        return response.data;
    },

    // clear cart
    cleat:async () => {
        const response = await api.post('/cart/clear/');
        return response.data
    },
};


export const categoriesAPI = {
    // get all categories
    getAllCategories: async () => {
        const response = await api.get('/categories/');
        return response.data;
    },

    // get single category
    getById: async (id) => {
        const response = await api.get(`/categories/${id}/`);
        return response.data;
    },

    // create category for (Admin)
    create: async (categoryData) => {
        const response = await api.post('/categories/', categoryData);
        return response.data;
    },

    // update category for (Admin)
    update: async (id, categoryData) => {
        const response = await api.patch(`/categories/${id}/`, categoryData);
        return response.data;
    },

    // delete category for (Admin)
    delete: async (id) => {
        const response = await api.delete(`/categories/${id}/`);
        return response.data;
    },
};


export const ordersAPI = {
    // get all orders
    getAll: async () => {
        const response = await api.get('/orders/');
        return response.data;
    },

    // get single order
    getById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // create new order
    create: async (orderData) => {
        const response = await api.post('/orders/', orderData);
        return response.data;
    },

    // update order status (Admin only)
    updateStatus: async (id, status) => {
        const response = await api.patch(`/orders/${id}/update_status/`, {status});
        return response.data;
    },

    // get order analytics (Admin only)
    getAnalytics: async () => {
        const response = await api.get('/orders/analytics/');
        return response.data;
    },
}


 export const productsAPI = {
    // get all products
    getAll: async (params = {}) => {
        const response = await api.get('/products/', {params})
        return response.data;
    },

    // get single product
    getById: async (id) => {
        const response = await api.get(`/products/${id}/`)
        return response.data;
    },

    // create product for (Admin)
    create: async(productData) => {
        const response = await api.post('/products/', productData);
        return response.data;
    },

    // update product for (Admin)
    update: async(id, productData) => {
        const response = await api.patch(`/products/${id}/`, productData)
        return response.data;
    },

    // delete product for (Admin)
    delete: async(id) => {
        const response = await api.delete(`/products/${id}/`)
        return response.data;
    },

    // get low stock products (Admin only)
    getLowStock: async () => {
        const response = await api.get('/products/low_stock/');
        return response.data;
    },
};

export default api;
