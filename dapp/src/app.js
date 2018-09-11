import React, { Component } from "react";
import {hot} from "react-hot-loader";
import { Container, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'

class App extends Component {
    render() {
        const coffee = <FontAwesomeIcon icon={faCoffee} />;
        return (
            <Container>
                <Button color="primary">Time for {coffee}</Button>                
        </Container>
        );
    }
}

export default hot(module)(App);
