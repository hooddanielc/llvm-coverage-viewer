export const SET_SEARCH_QUERY = 'SET_SEARCH_QUERY';
export const SET_SEARCH_ENABLED = 'SET_SEARCH_ENABLED';

export const search = ({query, search_list}) => async (dispatch) => {
  const filtered = search_list.filter((filename) => {
    return filename.indexOf(query) > -1;
  });
  dispatch({
    type: SET_SEARCH_QUERY,
    payload: {search_list: filtered},
  });
}

export const set_search_enabled = ({enabled, search_list}) => async (dispatch) => {
  dispatch({
    type: SET_SEARCH_ENABLED,
    payload: {
      enabled,
      search_list,
    },
  });
}
