import React from 'react';
import HeaderPage from '../HeaderPage/HeaderPage';
import BareSourceCodeViewer from '../BareSourceCodeViewer/BareSourceCodeViewer';
import CoverageSummary from '../CoverageSummary';
import MetalPaper from '../MetalPaper/MetalPaper';
import s from './Home.scss';

export default class extends React.Component {

  on_file_click(filename) {
    this.props.history.push(`/browse/${filename}`)
  }

  render_summary() {
    return (
      <CoverageSummary
        report={this.props.report}
        onClick={(filename) => this.on_file_click(filename)}
      />
    );
  }

  render() {
    return (
      <HeaderPage report={this.props.report}>
        <MetalPaper className={s.summary}>
          <div className={s.summary_container}>
            {this.render_summary()}
          </div>
        </MetalPaper>
      </HeaderPage>
    );
  }
}
