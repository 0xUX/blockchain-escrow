import React from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';


export const NoMatch = ({ location }) => (
    <div>Page not found: <code>{location.pathname}</code></div>
);


export const AgentLink = ({ agentAccount }) => (
    <div className="card p-3 mt-1">
        <div>Hello {agentAccount}! <Link to="/agent">My personal agent page >></Link></div>
    </div>
);
