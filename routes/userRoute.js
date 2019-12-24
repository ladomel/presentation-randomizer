const mongoose = require('mongoose');
const Thesis = mongoose.model('thesis');
const axios = require('axios');

module.exports = (app) => {

    app.get(`/api/users`, async (req, res) => {

        const config = {
            headers: {
                'Authorization': process.env.OKTA_API_AUTH_HEADER,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        let data = await axios.get(process.env.OKTA_API_URL + '/groups', config);

        let oktaGroup = data.data.find(i => i.profile.name === process.env.OKTA_GROUP_NAME);

        if (oktaGroup) {
            let users = await axios.get(process.env.OKTA_API_URL + `/groups/${oktaGroup.id}/users`, config);

            users = users.data.map(item => {
                return {
                    name: item.profile['firstName'] + " " + item.profile['lastName'],
                    email: item.profile['email']
                }
            });

            return res.status(200).send(users);
        }

        return res.status(200).send([]);
    });

};