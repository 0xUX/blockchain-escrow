import React from "react";

export const NoMatch = ({ location }) => (
    <div>Page not found: <code>{location.pathname}</code></div>
);
