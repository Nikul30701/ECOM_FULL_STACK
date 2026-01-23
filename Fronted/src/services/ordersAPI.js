import api from "./api";

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