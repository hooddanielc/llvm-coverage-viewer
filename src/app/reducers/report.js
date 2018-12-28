import {
  REPORT_LOAD_REQUEST,
  REPORT_LOAD_RESPONSE,
  REPORT_LOAD_ERROR,

  RENDER_COVERAGE_REQUEST,
  RENDER_COVERAGE_RESPONSE,
  RENDER_COVERAGE_RESPONSE_CHUNK,
  RENDER_COVERAGE_ERROR,
} from '../actions/report';

export default (state = {
  instance: null,
  cached_coverage_response: {},
}, action) => {
  switch (action.type) {
    case REPORT_LOAD_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      }
    }
    case REPORT_LOAD_RESPONSE: {
      return {
        ...state,
        ...action.payload,
        loading: false,
        instance: action.payload.instance,
        error: null,
      }
    }
    case REPORT_LOAD_REQUEST: {
      return {
        ...state,
        loading: true,
      }
    }
    case RENDER_COVERAGE_REQUEST: {
      return {
        ...state,
        loading_file_coverage: action.payload.filename,
        last_file_coverage_request: action.payload.filename,
        rendered_lines: [],
        coverage_count: [],
      }
    }
    case RENDER_COVERAGE_RESPONSE: {
      if (state.last_file_coverage_request !== action.payload.filename) {
        break;
      }
      return {
        ...state,
        loading_file_coverage: false,
      }
    }
    case RENDER_COVERAGE_RESPONSE_CHUNK: {
      if (state.last_file_coverage_request !== action.payload.filename) {
        break;
      }
      const {chunk, coverage} = action.payload;
      const rendered_lines = state.rendered_lines.concat(chunk);
      const coverage_count = state.coverage_count.concat(coverage);
      return {
        ...state,
        // rendered_lines,
        // coverage_count,
        cached_coverage_response: {
          ...state.cached_coverage_response,
          [action.payload.filename]: {
            rendered_lines,
            coverage_count,
          }
        }
      }
    }
  }
  return state;
}
