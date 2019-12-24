import axios from 'axios';

export default {
    rate: async (token, data) => {
        let res = await axios.post(`/api/rating`, data,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data || [];
    }
}