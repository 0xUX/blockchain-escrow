import 'regenerator-runtime/runtime';
import React from "react";
import ReactDOM from "react-dom";
import './scss/app.scss';
import App from "./app.js";
import store from "./redux/store";

import { DrizzleProvider } from 'drizzle-react';
import drizzleOptions from './drizzle-options';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
library.add(faCircleNotch);



ReactDOM.render(<DrizzleProvider options={drizzleOptions} store={store}><App /></DrizzleProvider>, document.getElementById("root"));

//ReactDOM.render(<Provider store={store}><App /></Provider>,document.getElementById("root"));
