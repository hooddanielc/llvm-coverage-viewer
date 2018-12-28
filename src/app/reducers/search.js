import {
  SET_SEARCH_QUERY,
  SET_SEARCH_ENABLED,
} from '../actions/search';

export default (state = {
  enabled: false,
  search_list: [],
}, action) => {
  switch (action.type) {
    case SET_SEARCH_QUERY: {
      return {
        ...state,
        search_list: action.payload.search_list,
      }
    }
    case SET_SEARCH_ENABLED: {
      return {
        ...state,
        search_list: action.payload.search_list,
        enabled: action.payload.enabled,
      }
    }
  }
  return state;
}
