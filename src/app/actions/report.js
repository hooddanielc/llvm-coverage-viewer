// load report
import path from 'path';
import fs from '../util/fs';
import vdom_to_html from 'vdom-to-html';
import {VNode} from 'virtual-dom';
import {dispatch} from 'redux';
import {Report} from '../models';

export const REPORT_LOAD_REQUEST = 'REPORT_LOAD_START';
export const REPORT_LOAD_RESPONSE = 'REPORT_LOAD_RESPONSE';
export const REPORT_LOAD_ERROR = 'REPORT_LOAD_ERROR';

export const RENDER_COVERAGE_REQUEST = 'RENDER_COVERAGE_REQUEST';
export const RENDER_COVERAGE_RESPONSE = 'RENDER_COVERAGE_RESPONSE';
export const RENDER_COVERAGE_RESPONSE_CHUNK = 'RENDER_COVERAGE_RESPONSE_CHUNK';
export const RENDER_COVERAGE_ERROR = 'RENDER_COVERAGE_ERROR';

const get_report_worker_src = () => {
  try {
    const src = fs.readFileSync('%%___highlight_worker___%%.js');
    return src;
  } catch (e) {
    return fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'dist', 'llvm-coverage-viewer-highlight-worker.js'));
  }
}

const get_report_worker = () => {
  const src = get_report_worker_src();
  let blob = null;
  try {
    blob = new Blob([src], {type: 'application/javascript'});
  } catch (e) { // Backwards-compatibility
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
    blob = new BlobBuilder();
    blob.append(response);
    blob = blob.getBlob();
  }
  return new Worker(URL.createObjectURL(blob));
}

export const load = ({filename}) => async (dispatch) => {
  dispatch({
    type: REPORT_LOAD_REQUEST,
    payload: {filename},
  });

  try {
    const worker = get_report_worker();
    const report_json = fs.readFileSync(filename, 'utf8');

    return new Promise((resolve, reject) => {
      const worker_cb = (e) => {
        switch (e.data.type) {
          case 'error': {
            worker.terminate();
            dispatch({
              type: REPORT_LOAD_ERROR,
              payload: e.data.payload,
            });

            reject(e.data);
            break;
          }
          case 'report_json_received': {
            worker.postMessage({
              type: 'report_send_complete',
            });
            break;
          }
          case 'report_ok': {
            dispatch({
              type: REPORT_LOAD_RESPONSE,
              payload: {
                ...e.data.payload,
                filename,
                report_json,
                worker,
              },
            });

            worker.removeEventListener('message', worker_cb);
            resolve();
            break;
          }
        }
      }

      worker.addEventListener('message', worker_cb);

      worker.postMessage({
        type: 'report_json',
        payload: {
          str: report_json,
        },
      });
    });
  } catch (error) {
    dispatch({
      type: REPORT_LOAD_ERROR,
      payload: {filename, error},
    });
    return Promise.reject(error);
  }
}

export const render_code_coverage = ({filename, report, worker}) => async (dispatch) => {
  dispatch({
    type: RENDER_COVERAGE_REQUEST,
    payload: {filename},
  });

  try {
    const prefix = report.filename_prefix;
    const file_src = fs.readFileSync(filename, 'utf8');
    const rendered_lines = [];

    return new Promise((resolve, reject) => {
      const worker_cb = (e) => {
        if (e.data && e.data.payload && e.data.payload.filename !== filename) {
          return;
        }

        switch (e.data.type) {
          case 'error': {
            reject(e.data);
            break;
          }
          case 'file_str_received': {
            worker.postMessage({
              type: 'build_file',
              payload: {
                filename,
              },
            });
            break;
          }
          case 'file_ok': {
            worker.postMessage({
              type: 'get_highlight_html',
              payload: {
                filename,
              }
            });
            break;
          }
          case 'get_highlight_html_chunk': {
            dispatch({
              type: RENDER_COVERAGE_RESPONSE_CHUNK,
              payload: {
                ...e.data.payload,
                filename,
              }
            });
            break;
          }
          case 'get_highlight_html_ok': {
            dispatch({
              type: RENDER_COVERAGE_RESPONSE,
              payload: {
                filename,
              }
            });
            worker.removeEventListener('message', worker_cb);
            resolve();
            break;
          }
        }
      }

      worker.addEventListener('message', worker_cb);

      worker.postMessage({
        type: 'file_str',
        payload: {
          filename,
          str: file_src,
        },
      });
    });
  } catch (err) {
    dispatch({
      type: RENDER_COVERAGE_ERROR,
      payload: {filename},
    });
  }
}
