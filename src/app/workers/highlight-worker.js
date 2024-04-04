import virtual_dom from 'virtual-dom';
import html_to_vdom from 'html-to-vdom';
import hljs from 'highlight.js';
import wrap_new_lines_in_spans from '../util/wrap-new-lines-in-spans';
import {Report} from '../models';

const convert_html = html_to_vdom({
  VNode: virtual_dom.VNode,
  VText: virtual_dom.VText,
});

let state = {
  raw_json: '',
  report_json: null,
  report: null,
  files: {},
}

export const on_ping = ({self, e}) => {
  self.postMessage({
    ...e.data,
    type: 'pong',
  });
}

export const on_report_json = ({self, e}) => {
  const {str} = e.data.payload;
  state.raw_json += str;
  self.postMessage({
    type: 'report_json_received',
    payload: {
      total_length_received: state.raw_json.length,
    }
  });
}

export const on_send_complete = ({self, e}) => {
  state.report_json = JSON.parse(state.raw_json);
  state.report = new Report({report: state.report_json});
  // console.log('filenames', state.report.get_filenames());
  // console.log('short_filenames', state.report.get_short_filenames());
  // console.log('filename_prefix', state.report.get_filename_prefix());
  self.postMessage({
    type: 'report_ok',
    payload: {
      filenames: state.report.get_filenames(),
      short_filenames: state.report.get_short_filenames(),
      filename_prefix: state.report.get_filename_prefix(),
      summary: state.report.get_summary(),
    }
  });
}

export const on_file_str = ({self, e}) => {
  const {filename, str} = e.data.payload;
  const file_state = state.files[filename];
  if (!file_state) {
    state.files[filename] = {
      str: str,
      filename: filename,
    }
  } else {
    file_state.str += str;
  }

  self.postMessage({
    type: 'file_str_received',
    payload: {
      length: state.files[filename].str.length,
      filename,
    }
  });
}

export const on_build_file = ({self, e}) => {
  const {filename} = e.data.payload;
  if (!state.files[filename]) {
    throw new Error(`${filename} does not exist`);
  } else {
    const instance = state.report.build_file(filename, state.files[filename].str);
    state.files[filename].instance = instance;

    self.postMessage({
      type: 'file_ok',
      payload: {
        with_str: state.files[filename].str,
        filename,
      }
    });
  }
}

export const on_get_highlight_html = ({self, e}) => {
  const {payload} = e.data;
  const filename = payload.filename;
  const language = payload.language || 'cpp';
  const file = state.files[filename];

  if (!file || !file.instance) {
    throw new Error(`${filename} does not have an instance`);
  }

  try {
    const {value} = hljs.highlight(file.str, {language: language});
    const vtree = convert_html(value);
    const vtree_as_array = vtree.length ? vtree : [vtree];
    const result = wrap_new_lines_in_spans(vtree_as_array);
    const output = result.output;

    const coverage = [];
    for (let i = 0; i < output.length; ++i) {
      coverage.push(file.instance.count_line_src(i + 1));
    }

    const date = new Date();
    self.postMessage({
      type: 'get_highlight_html_chunk',
      payload: {
        chunk: output,
        coverage,
        date,
        filename,
      }
    });

    self.postMessage({
      type: 'get_highlight_html_ok',
      payload: {
        filename,
      }
    });
  } catch (e) {
    self.postMessage({
      type: 'error',
      payload: {
        message: e.message,
        stack: e.stack,
        filename,
      }
    });
  }
}

export default ({self}) => {
  self.addEventListener('message', (e) => {
    try {
      const args = {self, e}
      const type = e.data && e.data.type;
      switch (type) {
        case 'ping': on_ping(args); break;
        case 'report_json': on_report_json(args); break;
        case 'report_send_complete': on_send_complete(args); break;
        case 'file_str': on_file_str(args); break;
        case 'build_file': on_build_file(args); break;
        case 'get_highlight_html': on_get_highlight_html(args); break;
      }
    } catch (e) {
      self.postMessage({
        type: 'error',
        payload: {
          message: e.message,
          stack: e.stack,
        }
      });
    }
  }, false);
}
