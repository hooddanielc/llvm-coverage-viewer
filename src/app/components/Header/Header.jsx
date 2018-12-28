import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {Link, withRouter} from 'react-router-dom'
import render_static_report from '../../util/render-static-report';
import {set_search_enabled} from '../../actions/search';
import MetalPaper from '../MetalPaper/MetalPaper';
import s from './Header.scss';

import classnames from 'classnames';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';

import {search} from '../../actions/search';

const search_icon_button_styles = {
  root: {
    padding: '6px',
    '&:hover': {
      borderRadius: 0,
    }
  }
}

const search_icon_styles = {
  root: {
    borderRadius: 0,
    '&:hover': {
      borderRadius: 0,
    }
  }
}

const input_base_styles = {
  root: {
    fontSize: '19px',
  }
}

class Header extends React.Component {
  static get defaultProps() {
    return {
      title: 'LLVM Coverage Viewer',
      SearchIconButtonComponent: withStyles(search_icon_button_styles)(IconButton),
      SearchIconComponent: withStyles(search_icon_styles)(SearchIcon),
      InputBaseComponent: withStyles(input_base_styles)(InputBase),
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      search_open: false,
    }
  }

  on_search_change(e) {
    this.props.dispatch(search({
      query: e.target.value,
      search_list: this.props.report.short_filenames,
    }));
  }

  set_search_enabled() {
    this.props.dispatch(set_search_enabled({
      search_list: this.props.report.short_filenames,
      enabled: !this.props.search.enabled,
    }));
  }

  componentDidUpdate() {
    if (this.props.search.enabled) {
      this.search_input.focus();
    }
  }

  shouldComponentUpdate(prevProps) {
    const {enabled} = this.props.search;
    return enabled !== prevProps.search.enabled || !enabled;
  }

  render_search() {
    const {
      SearchIconButtonComponent,
      SearchIconComponent,
      InputBaseComponent,
    } = this.props;

    const cx = classnames({
      [s.search_open]: this.props.search.enabled,
    }, s.search_wrapper);

    return (
      <div className={cx}>
        <div className={s.search}>
          <InputBaseComponent
            key="header_search"
            onChange={(e) => this.on_search_change(e)}
            className={s.search_input}
            placeholder="Search"
            inputRef={(el) => this.search_input = el}
          />
          <SearchIconButtonComponent
            className={s.search_icon_button}
            aria-label="Search"
            onClick={() => this.set_search_enabled()}
          >
            <SearchIconComponent />
          </SearchIconButtonComponent>
        </div>
      </div>
    );
  }

  render() {
    return (
      <MetalPaper className={s.header}>
        <Button className={s.button} onClick={() => this.props.history.push('/')}>
          {this.props.title}
        </Button>
        {this.render_search()}
      </MetalPaper>
    );
  }
}

export default withRouter(Header);