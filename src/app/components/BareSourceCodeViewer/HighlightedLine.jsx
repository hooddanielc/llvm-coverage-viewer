import React from 'react';
import s from './HighlightedLine.module.scss';

export default class extends React.Component {
  componentDidMount() {
    this.render_html();
  }
  
  componentDidUpdate() {
    this.render_html();
  }

  render_html() {
    this.el.innerHTML = this.props.html;
    this.render_coverage();
  }

  render_coverage() {
    if (this.props.coverage && Array.isArray(this.props.coverage)) {
      const highlight_container = document.createElement('span');
      highlight_container.className = s.highlight_container;

      this.props.coverage.forEach(({count, src}) => {
        const span = document.createElement('span');
        span.textContent = src;
        if (count === 0) {
          span.className = s.not_covered;
        } else if (count > 0) {
          span.className = s.is_covered;
        } else {
          span.className = s.is_excluded;
        }
        highlight_container.append(span);
      });
      this.el.append(highlight_container);
    }
  }

  render() {
    return (
      <div
        className={s.line_container}
        style={this.props.style}
        ref={(el) => this.el = el}
        onClick={this.props.onClick}
      />
    );
  }
}
