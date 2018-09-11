import React, { Component } from "react";
import {hot} from "react-hot-loader";
import { Button } from 'reactstrap';

class App extends Component {
    render() {        
        return (
            <Button color="primary">Hello</Button>
        );
    }
}

export default hot(module)(App);
