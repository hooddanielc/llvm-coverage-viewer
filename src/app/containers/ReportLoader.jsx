import React from 'react';
import {connect} from 'react-redux'
import {load} from '../actions/report';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

class ReportLoaderComponent extends React.Component {
  click_load_report() {
    const test = 'test/fixtures/cpp_project/report.json';
    this.props.dispatch(load({filename: test}));
  }

  render_error_message() {
    if (this.props.state_props.report.error) {
      return (
        <Alert severity="error">error: {this.props.state_props.report.error.message}</Alert>
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
      return <Container maxWidth="sm"><p>loading</p></Container>
    }
    const info = 'Hello looks like you want to load a report :)';
    return (
      <Container maxWidth="sm">
          <Box
            alignItems="center"
            sx={{ marginTop: '8rem' }}
          >
            <Alert severity="info">{info}</Alert>
            {this.render_error_message()}
            <Button onClick={this.click_load_report.bind(this)}>Load Report</Button>
        </Box>
      </Container>
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
