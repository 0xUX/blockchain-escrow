import React, { Component } from "react";
import {hot} from "react-hot-loader";
import { Header, Button } from 'semantic-ui-react';
import './css/app.css';
import logo from './img/logo.png';
import _ from 'lodash-es';

class App extends Component {
    state = {
        buttonTxt: 'Hallo'
    };
    
    onClick = async () => {
        await this.setState({ buttonTxt: 'Hi!'});
    };
    
    render() {
        console.log(this.state.buttonTxt);
        return (
            <div>
                <Header className="gray">
                    <img src={logo} alt="0xUX logo" />
                </Header>
                <Button onClick={this.onClick}>{this.state.buttonTxt}</Button>
            </div>
        );
    }
}

export default hot(module)(App);
