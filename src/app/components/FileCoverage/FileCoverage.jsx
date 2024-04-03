import React from 'react';
import withRouter from "../../util/with_router";
import BareSourceCodeViewer from '../BareSourceCodeViewer/BareSourceCodeViewer';
import './FileCoverage.scss';
import {render_code_coverage} from '../../actions/report';

class FileCoverage extends React.Component {
  load_path() {
    const {report} = this.props;
    const prefix = this.props.report.filename_prefix;
    const filename = `${prefix}${this.props.path}`;
    if (this.props.last_file_coverage_request !== filename && !this.props.cached_coverage_response[filename]) {
      const {report_worker: worker} = this.props;
      this.props.dispatch(render_code_coverage({filename, report, worker}));
    }
  }

  componentDidMount() {
    this.load_path();
  }


  componentDidUpdate() {
    this.load_path();
  }

  render() {
    const prefix = this.props.report.filename_prefix;
    if (!this.props.cached_coverage_response[`${prefix}${this.props.path}`]) {
      return <h1>Loading</h1>
    }

    const {rendered_lines, coverage_count} = this.props.cached_coverage_response[`${prefix}${this.props.path}`];

    return (
      <BareSourceCodeViewer
        className={this.props.className}
        language="cpp"
        html={rendered_lines}
        coverage_count={coverage_count}
      />
    );
  }
}

export default withRouter(FileCoverage);
