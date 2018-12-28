import React from 'react';
import MetalPaper from '../MetalPaper/MetalPaper';
import classnames from 'classnames';
import {ButtonBase} from '@material-ui/core';
import s from './ResizablePaper.scss';
export default class extends React.Component {
  static get defaultProps() {
    return {}
  }

  constructor(props) {
    super(props);
    this.grabbed = false;
    this.last_x = 0;
    this.last_y = 0;
    this.width = 300;
    this.on_grab_move_ref = this.on_grab_move.bind(this);
    this.on_grab_up_ref = this.on_grab_up.bind(this);
    this.state = {width: this.width};
  }

  componentDidMount() {
    document.body.addEventListener('mousemove', this.on_grab_move_ref);
    document.body.addEventListener('mouseup', this.on_grab_up_ref);
  }

  componentWillUnmount() {
    document.body.removeEventListener('mousemove', this.on_grab_move_ref);
    document.body.removeEventListener('mouseup', this.on_grab_up_ref);
  }

  get_style() {
    return {
      width: `${this.state.width}px`,
    }
  }

  on_grab_down(e) {
    const {screenX: x, screenY: y} = e;
    this.last_x = x;
    this.last_y = y;
    this.grabbed = true;
  }

  on_grab_move(e) {
    if (this.grabbed) {
      const {screenX: x, screenY: y} = e;
      const offset_x = x - this.last_x;
      const offset_y = y - this.last_y;
      this.last_x = x;
      this.last_y = y;
      this.width = this.width + offset_x;
      this.setState({
        width: this.width,
      });
    }
  }

  on_grab_up() {
    this.grabbed = false;
  }

  render() {
    return (
      <MetalPaper
        {...this.props}
        className={classnames(this.props.className, s.container)}
        style={this.get_style()}
      >
        {this.props.children}
        <div className={s.vertical_handlebar}
          onMouseDown={this.on_grab_down.bind(this)}
        >
          <ButtonBase className={s.vertical_grab}></ButtonBase>
        </div>
      </MetalPaper>
    );
  }
}
