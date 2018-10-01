import 'regenerator-runtime/runtime';
import React from "react";
import ReactDOM from "react-dom";
import './scss/app.scss';
import App from "./app.js";
import { Provider } from "react-redux";
import store from "./redux/store";

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
library.add(faCircleNotch);

ReactDOM.render(<Provider store={store}><App /></Provider>,document.getElementById("root"));
