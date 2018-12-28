import React from 'react';
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import Header from '../../containers/Header';
import s from './HeaderPage.scss';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CodeIcon from '@material-ui/icons/Code';

import {set_search_enabled} from '../../actions/search';

class HeaderPage extends React.Component {

  on_click_filename(filename) {
    this.props.dispatch(set_search_enabled({
      enabled: false,
      search_list: this.props.report.short_filenames
    }));
    this.props.history.push(`/browse/${filename}`);
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
