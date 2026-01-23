 import api from './api';

 export const productsAPI = {
    // get all products
    getAllProducts: async (params = {}) => {
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