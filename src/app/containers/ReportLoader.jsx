import React from 'react';
import {connect} from 'react-redux'
import {load} from '../actions/report';

class ReportLoaderComponent extends React.Component {
  click_load_report() {
    const test = 'test/fixtures/cpp_project/report.json';
    this.props.dispatch(load({filename: test}));
  }

  render_error_message() {
    if (this.props.state_props.report.error) {
      return (
        <p>error: {this.props.state_props.report.error.message}</p>
      );
    }
    return null;
  }

  render_loader() {
    const bundled = '%%___static_report___%%.json';
    if (document.querySelector(`script[type="text/localfs"][data-path="${bundled}"]`)) {
      if (this.props.state_props.report.error) {
        return this.render_error_message();
      }
      if (!this.loaded_report) {
        this.loaded_report = true;
        setTimeout(() => this.props.dispatch(load({filename: bundled})));
      }
      return <p>loading</p>
    }

    return (
      <div>
        <p>Hello looks like you want to load a report :)</p>
        {this.render_error_message()}
        <button onClick={this.click_load_report.bind(this)}>Load Report</button>
      </div>
    );
  }

  render() {
    if (!this.props.component || !this.props.state_props.report.worker) {
      return this.render_loader();
    }
    const Component = this.props.component;
    return (
      <Component
        {...this.props.router_props}
        report={this.props.state_props.report}
      />
    );
  }
}

const mapStateToProps = (state) => {
  // select stuff
  return {state_props: state};
}

export const ReportLoader = connect(
  mapStateToProps,
)(ReportLoaderComponent);

export const wrap_report_loader = (Component) => (
  (props) => <ReportLoader router_props={props} component={Component} />
);

export default ReportLoader;
