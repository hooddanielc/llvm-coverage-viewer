import React from 'react';
import withRouter from "/@/app/util/with_router";
import {connect} from 'react-redux'
import Header from '/@/app/containers/Header';
import s from './HeaderPage.module.scss';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CodeIcon from '@mui/icons-material/Code';

import {set_search_enabled} from '../../actions/search';

class HeaderPage extends React.Component {

  on_click_filename(filename) {
    this.props.dispatch(set_search_enabled({
      enabled: false,
      search_list: this.props.report.short_filenames
    }));
    this.props.router.navigate(`/browse/${filename}`);
  }

  render_search_list() {
    if (this.props.search.enabled) {
      return (
        <List className={s.search_container}>
          {this.props.search.search_list.map((filename, i) => (
            <ListItem
              key={`search-item-${i}`}
              onClick={() => this.on_click_filename(filename)}
              button
            >
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText primary={filename} />
            </ListItem>
          ))}
        </List>
      );
    }
    return null;
  }
  render() {
    return (
      <div>
        <Header className={s.header} report={this.props.report}/>
        <div className={s.child_container}>
          {this.render_search_list()}
          {this.props.children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
}

export const HeaderPageContainer = connect(
  mapStateToProps,
)(withRouter(HeaderPage));

export default HeaderPageContainer;
