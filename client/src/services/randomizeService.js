import axios from 'axios';

export default {
    randomize: async (token, data) => {
        let res = await axios.post(`/api/randomize`, data,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data || [];
    }
}