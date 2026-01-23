import api from "./api";

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
