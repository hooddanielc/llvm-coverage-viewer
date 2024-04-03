import {legacy_createStore, applyMiddleware, combineReducers} from 'redux';
import { thunk } from 'redux-thunk';
import reducers from './reducers';

const store = legacy_createStore(
  combineReducers(reducers),
  applyMiddleware(thunk),
);
export default store;
