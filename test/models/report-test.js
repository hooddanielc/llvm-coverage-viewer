import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import exec from '../util/exec';
import {Report} from '../../src/app/models';
import WebWorker from 'llvm-coverage-viewer-webworker';
import walk from '../util/walk';

import {
  setup, teardown, fixture_project_dir, fixture_report,
  build_fixture_script
} from '../util/report-support';

const get_cpp_project_filepaths = async () => (await walk(fixture_project_dir))
  .filter((s) => s.match(/\.(h|cc)$/))
  .sort();

describe('models::Report', () => {
  let project_src_files = null;
  let report = null;

  beforeEach(async () => {
    const result = await setup();
    report = JSON.parse(result.report_json);
    project_src_files = await get_cpp_project_filepaths();
  });

  afterEach(async () => {
    await teardown();
  });

  it('exists', () => {
    expect(Report).to.be.a('function');
  });

  it('it keeps original report', () => {
    const subject = new Report({report});
    expect(subject.props.report).to.eql(report);
  });

  it('returns all filenames', () => {
    const subject = new Report({report});
    const filenames = subject.get_filenames().sort();
    expect(filenames).to.eql(project_src_files);
  });

  it('returns all short filenames', () => {
    const subject = new Report({report});
    const expected = project_src_files
      .map((p) => path.relative(fixture_project_dir, p))
      .sort();
    const actual = subject.get_short_filenames();
    expect(actual).to.eql(expected);
  });
});
