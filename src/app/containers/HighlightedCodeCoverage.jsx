import FileCoverage from '/@/app/components/FileCoverage/FileCoverage';
import React from 'react';
import {connect} from 'react-redux'

const mapStateToProps = (state) => {
  return {
    loading_file_coverage: state.report.loading_file_coverage,
    last_file_coverage_request: state.report.last_file_coverage_request,
    rendered_lines: state.report.rendered_lines,
    coverage_count: state.report.coverage_count,
    report: state.report,
    report_worker: state.report.worker,
    cached_coverage_response: state.report.cached_coverage_response,
  };
}

export const HighlightedCodeCoverage = connect(
  mapStateToProps,
)(FileCoverage);

export default HighlightedCodeCoverage;
