import React, { Component } from "react";
import {hot} from "react-hot-loader";
import { Container, Button } from 'reactstrap';

class App extends Component {
    render() {        
        return (
            <Container>
                <Button color="primary">Hello</Button>
            </Container>
        );
    }
}

export default hot(module)(App);
