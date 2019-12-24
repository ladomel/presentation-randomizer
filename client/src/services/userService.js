import axios from 'axios';

export default {
    load: async (token) => {
        let res = await axios.get(`/api/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data || [];
    }
}