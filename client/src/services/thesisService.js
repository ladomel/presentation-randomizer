import axios from 'axios';

export default {
    load: async (token) => {
        let res = await axios.get(`/api/thesis`,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data || [];
    },

    save: async(token, item) => {
        let res = await axios.post(`/api/thesis`, item, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data || [];
    },

    update: async(token, id, item) => {
        let res = await axios.put(`/api/thesis/` + id, item, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data || [];
    },

    delete: async(token, id) => {
        let res = await axios.delete(`/api/thesis/` + id, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data || [];
    }
}