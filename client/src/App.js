import React, { Component } from 'react';
import {BrowserRouter, Route} from 'react-router-dom';

import './App.css';
import ThesesGrid from "./components/ThesisGrid";

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Route path="/" component={ThesesGrid} />
            </BrowserRouter>
        );
    }
}

export default App;