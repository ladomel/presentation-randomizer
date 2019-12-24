import React, { Component } from 'react';
import {BrowserRouter, Redirect, Route} from 'react-router-dom';
import { Security, SecureRoute, ImplicitCallback } from '@okta/okta-react';

import './App.css';
import ThesesGrid from "./components/ThesisGrid";

const oktaConfig = {
    issuer: process.env.REACT_APP_OKTA_ISSUER,
    redirect_uri: `${window.location.origin}/implicit/callback`,
    client_id: process.env.REACT_APP_OKTA_CLIENT_ID,
};

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Security {...oktaConfig}>
                    <Route exact path="/">
                        <Redirect to="/theses" />
                    </Route>
                    <SecureRoute path="/theses" component={ThesesGrid} />
                    <Route path="/implicit/callback" component={ImplicitCallback} />
                </Security>
            </BrowserRouter>
        );
    }
}

export default App;