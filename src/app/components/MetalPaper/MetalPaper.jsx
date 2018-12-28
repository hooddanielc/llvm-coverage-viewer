import React from 'react';
import classnames from 'classnames';
import s from './MetalPaper.scss';

class MetalPaper extends React.Component {
  render() {
    return (
      <div
        {...this.props}
        className={classnames(this.props.className, s.container)}
      >
        <div className={s.content}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default MetalPaper;
