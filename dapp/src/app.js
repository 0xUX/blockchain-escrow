import React, { Component } from "react";
import {hot} from "react-hot-loader";
import { Header, Button } from 'semantic-ui-react';
import './css/app.css';
import logo from './img/logo.png';

class App extends Component {
    render() {
        return (
            <div>
                <Header className="gray">
                    <img src={logo} />
                </Header>
                <Button>Hoi</Button>
            </div>
        );
    }
}

export default hot(module)(App);
