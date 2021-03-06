import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import {hot} from "react-hot-loader";
import Layout from './components/layout';
import Home from './components/home';
import Domain from './components/domain';
import { Agent, SellViaAgent } from './components/agent';
import { NoMatch } from './components/static';

class App extends Component {
    render() {
        return (
            <Router>
                <Layout>
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/agent" component={Agent}/>
                        <Route path="/agent/:agentKey" component={SellViaAgent}/>
                        <Route path="/domain/:domain" component={Domain}/>
                        <Redirect exact from="/domain" to="/" />
                        <Route component={NoMatch} />
                    </Switch>
                </Layout>
            </Router>
        );
    }
}

export default hot(module)(App);
