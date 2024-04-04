import React from 'react';
import HeaderPage from '../HeaderPage/HeaderPage';
import MetalPaper from '../MetalPaper/MetalPaper';
import ResizablePaper from '../ResizablePaper/ResizablePaper';
import s from './FileCoverageNavigation.module.scss';
import classnames from 'classnames';
import CollapsibleTree from '../CollapsibleTree/CollapsibleTree';
import HighlightedCodeCoverage from '../../containers/HighlightedCodeCoverage';

export default class FileCoverageNavigation extends React.Component {
  static get defaultProps() {
    return {
      title: 'Report Title',
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      open_dirs: {},
    }
  }

  render() {
    let { filename } = this.props.router.params;
    filename = decodeURIComponent(filename);
    return (
      <HeaderPage report={this.props.report}>
        <ResizablePaper className={s.navigation_container}>
          <CollapsibleTree path={filename} report={this.props.report} />
        </ResizablePaper>
        <MetalPaper className={s.file_content_container}>
          <div className={classnames(s.file_content_wrapper, 'hljs')}>
            <HighlightedCodeCoverage path={filename} className={s.highlighted_coverage} />
          </div>
        </MetalPaper>
      </HeaderPage>
    );
  }
}
