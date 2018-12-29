import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import HighlightWorker from '../../src/app/workers/highlight-worker';
import Worker from 'llvm-coverage-viewer-webworker';
import {
  setup, teardown, fixture_project_dir, fixture_report,
  build_fixture_script
} from '../util/report-support';

const highlight_worker_path = path.resolve(__dirname, '..', '..', 'dist', 'llvm-coverage-viewer-highlight-worker-test.js');
const partial_coverage_file_path = path.resolve(__dirname, '..', 'fixtures', 'cpp_project', 'partial_coverage.h');
const partial_coverage_src = fs.readFileSync(partial_coverage_file_path, 'utf8');

describe('shims::WebWorker', () => {
  let report_json = null;
  let worker = null;

  beforeEach(async () => {
    const result = await setup();
    report_json = result.report_json;
  });

  afterEach(async () => {
    await teardown();
    if (worker) {
      worker.terminate();
      worker = null;
    }
  });

  it('exists', () => {
    expect(Worker).to.be.a('function');
  });

  it('pings and pongs', async () => {
    await new Promise((resolve, reject) => {
      worker = new Worker(highlight_worker_path);
      worker.addEventListener('message', (e) => {
        expect(e.data).to.eql({type: 'pong'});
        resolve();
      }, false);
      worker.postMessage({
        type: 'ping',
      });
    })
  });

  it('receives report json', async () => {
    await new Promise((resolve, reject) => {
      worker = new Worker(highlight_worker_path);
      let received_first = false;
      const half = Math.floor(report_json.length / 2);
      const first = report_json.substring(0, half);
      const second = report_json.substring(half);

      const messages = [
        first,
        second,
      ]

      let response_num = 0;
      let total_received = 0;

      worker.addEventListener('message', (e) => {
        switch (e.data.type) {
          case 'report_json_received': {
            total_received += messages[response_num].length;
            expect(total_received).to.eql(e.data.payload.total_length_received);
            response_num += 1;
            break;
          }
          case 'report_ok': {
            resolve();
            break;
          }
        }
      });

      for (let str of messages) {
        worker.postMessage({
          type: 'report_json',
          payload: {
            str,
          },
        });
      }

      worker.postMessage({
        type: 'report_send_complete'
      });
    });
  });

  it('builds file', async () => {
    await new Promise((resolve, reject) => {
      worker = new Worker(highlight_worker_path);

      worker.addEventListener('message', (e) => {
        switch (e.data.type) {
          case 'error': {
            reject(e);
            break;
          }
          case 'report_json_received': {
            worker.postMessage({
              type: 'report_send_complete',
            });
            break;
          }
          case 'report_ok': {
            worker.postMessage({
              type: 'file_str',
              payload: {
                filename: partial_coverage_file_path,
                str: partial_coverage_src,
              },
            });
            break;
          }
          case 'file_str_received': {
            expect(e.data.payload.length).to.eql(partial_coverage_src.length);
            worker.postMessage({
              type: 'build_file',
              payload: {
                filename: partial_coverage_file_path,
              },
            });
            break;
          }
          case 'file_ok': {
            worker.postMessage({
              type: 'get_highlight_html',
              payload: {
                filename: partial_coverage_file_path,
              }
            });
            break;
          }
          case 'get_highlight_html_chunk': {
            expect(e.data.payload.coverage.length).to.eql(15);
            expect(e.data.payload.chunk.length).to.eql(15);
          }
          case 'get_highlight_html_ok': {
            resolve();
          }
        }
      });

      worker.postMessage({
        type: 'report_json',
        payload: {
          str: report_json,
        },
      });
    });
  });
});
