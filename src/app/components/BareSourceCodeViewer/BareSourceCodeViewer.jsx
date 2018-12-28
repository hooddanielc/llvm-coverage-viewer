import React, {Fragment} from 'react';
import classnames from 'classnames';

import '!style-loader!css-loader!highlight.js/styles/monokai.css';
import s from './BareSourceCodeViewer.scss';
import HighlightedLine from './HighlightedLine';

export default class BareSourceCodeViewer extends React.Component {
  static get defaultProps() {
    return {
      theme: 'github',
      language: 'cpp',
      src: `
        class what extends barbecue {
          constructor(props) {
            super(props);
          }
        }
      `,
    }
  }

  render_line_numbers() {
    return (
      <code className={classnames(s.code)}>
        {this.props.html.map((n, i) => (
          <div key={`line-number-${i + 1}`}>{i + 1}</div>
        ))}
      </code>
    );
  }

  render_code() {
    function createMarkuphtml(html) { return {__html: html}; };
    const cx = classnames(s.code);
    if (!this.props.html) {
      return <code className={cx} ref={(el) => this.container = el}>Loading</code>
    }
    return (
      <code className={cx} ref={(el) => this.container = el}>
        {this.props.html.map((html, i) => ([
          <HighlightedLine
            coverage={this.props.coverage_count[i]}
            key={`line-${i}`} html={html}
          />
        ]))}
      </code>
    );
  }

  render() {
    return (
      <div className={classnames(s.container, this.props.className)} ref={(el) => this.wrapper = el}>
        <div className={s.line_numbers_container}>
          {this.render_line_numbers()}
        </div>
        <div className={s.code_wrapper}>
          <pre>
              {this.render_code()}
          </pre>
        </div>
      </div>
    );
  }
}
