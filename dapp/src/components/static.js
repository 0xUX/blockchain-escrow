import React from "react";
import { USERS } from "../constants";
import { Link } from 'react-router-dom';

export const NoMatch = ({ location }) => (
    <div>Page not found: <code>{location.pathname}</code></div>
);

export const AgentLink = ({ agentKey }) => (
    <div className="card p-3 mt-1">
        <div>Hello {USERS[agentKey]}! <Link to="/agent">My personal agent page >></Link></div>
    </div>
);
