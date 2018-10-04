import 'regenerator-runtime/runtime'; // @@@ needed?
import React from "react";
import ReactDOM from "react-dom";
import { DrizzleProvider } from 'drizzle-react';
import drizzleOptions from './drizzle-options';
import './scss/app.scss';
import App from "./app.js";
import store from "./redux/store";

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
library.add(faCircleNotch);


ReactDOM.render(<DrizzleProvider options={drizzleOptions} store={store}><App /></DrizzleProvider>, document.getElementById("root"));
