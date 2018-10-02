import { takeLatest, call, put, all, fork } from "redux-saga/effects";
import { drizzleSagas } from 'drizzle';
import axios from "axios";

// watcher saga: watches for actions dispatched to the store, starts worker saga
function* watcherSaga() {
    yield takeLatest("FIAT_CALL_REQUEST", workerSaga);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// function that makes the api request and returns a Promise for response
async function fetchFiat(currency) {
    const symbol = 'eth' + currency.toLowerCase();
    // await sleep(5000); // emaulate slow API
    return axios({
        method: "get",
        url: `https://api.infura.io/v1/ticker/${symbol}`
    });
}

// worker saga: makes the api call when watcher saga sees the action
function* workerSaga(action) {
    try {
        const response = yield call(fetchFiat, action.payload.currency);
        const fiat = response.data.bid;

        // dispatch a success action to the store with the new fiat
        yield put({ type: "FIAT_CALL_SUCCESS", fiat });

    } catch (error) {
        // dispatch a failure action to the store with the error
        yield put({ type: "FIAT_CALL_FAILURE", error });
    }
}

// drizzle sagas
export default function* rootSaga() {
    // add the watcherSaga
    drizzleSagas.push(watcherSaga);
    yield all(
        drizzleSagas.map(saga => fork(saga))
    );
}
