import { takeLatest, call, put } from "redux-saga/effects";
import axios from "axios";

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* watcherSaga() {
    yield takeLatest("FIAT_CALL_REQUEST", workerSaga);
}

// function that makes the api request and returns a Promise for response
function fetchFiat() {
    return axios({
        method: "get",
        url: "https://api.infura.io/v1/ticker/ethusd"
    });
}

// worker saga: makes the api call when watcher saga sees the action
function* workerSaga() {
    try {
        const response = yield call(fetchFiat);
        const fiat = response.data.bid;

        // dispatch a success action to the store with the new fiat
        yield put({ type: "FIAT_CALL_SUCCESS", fiat });

    } catch (error) {
        // dispatch a failure action to the store with the error
        yield put({ type: "FIAT_CALL_FAILURE", error });
    }
}
