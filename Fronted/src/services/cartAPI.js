import api from "./api";

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