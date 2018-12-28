import fs from 'fs';
import path from 'path';
import exec from './exec';

export const fixture_project_dir = path.resolve(__dirname, '..', 'fixtures', 'cpp_project');
export const fixture_report = path.join(fixture_project_dir, 'report.json');
export const build_fixture_script = path.join(fixture_project_dir, 'build_report_fixture.sh');

export const setup = async () => {
  await exec(build_fixture_script, [], {
    cwd: fixture_project_dir,
  });
  const report_json = fs.readFileSync(fixture_report, 'utf8');
  return {report_json}
}

export const teardown = async () => {
  fs.unlinkSync(fixture_report);
}
