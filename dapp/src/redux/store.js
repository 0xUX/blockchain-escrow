import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./reducers";
import { watcherSaga } from "./sagas";

const sagaMiddleware = createSagaMiddleware();

const reduxDevTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const store = createStore(
    rootReducer,
    compose(applyMiddleware(sagaMiddleware), reduxDevTools)
);

sagaMiddleware.run(watcherSaga);

export default store;
