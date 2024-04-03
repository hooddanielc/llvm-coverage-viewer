import React from 'react';
import s from './CollapsibleTree.module.scss';
import path from '../../util/path';
import classnames from 'classnames';

import withRouter from "../../util/with_router";

import { withStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CodeIcon from '@mui/icons-material/Code'

const styles = theme => ({
  root: {
    overflow: 'auto',
    height: '100%',
    width: '100%',
  },
  selected_file: {
    backgroundColor: '#ddd',
    '&:hover': {
      backgroundColor: '#eee',
    }
  },
  folder_icon_expanded: {
    transform: 'rotate(90deg)',
    transition: 'transform 0.2s',
  }
});

const list_styles = theme => ({
  root: {
    padding: '0',
  }
});

const list_item_styles = theme => ({
  root: {
    padding: '5px',
  }
});

const list_item_icon_styles = theme => ({
  root: {
    marginRight: '5px',
  }
});

const icon_styles = theme => ({
  root: {
    width: '0.75em',
    height: '0.75em',
  }
});

const list_item_text_styles = theme => ({
  root: {
    paddingLeft: '5px',
  }
});

const file_icon_styles = them => ({
  root: {
    width: '0.5em',
    height: '0.5em',
    marginLeft: '0.125em',
  }
});

const collapse_styles = theme => ({
  container: {
    marginLeft: '0',
  }
});

class CollapsibleTree extends React.Component {
  static get defaultProps() {
    return {
      title: 'Report Title',
      ListItemComponent: withStyles(list_item_styles)(ListItem),
      ListComponent: withStyles(list_styles)(List),
      ListItemIconComponent: withStyles(list_item_icon_styles)(ListItemIcon),
      FolderIconComponent: withStyles(icon_styles)(ChevronRight),
      FileIconComponent: withStyles(file_icon_styles)(CodeIcon),
      CollapseComponent: withStyles(collapse_styles)(Collapse),
      ListItemTextComponent: withStyles(list_item_text_styles)(ListItemText),
    }
  }

  get_selected_path() {
    const prefix = this.props.report.filename_prefix;
    const path_parts = prefix.split('/').filter((p) => p !== '');
    const dirname = path_parts[path_parts.length - 1];
    return `${dirname}/${this.props.path}`;
  }

  constructor(props) {
    super(props);
    const prefix = this.props.report.filename_prefix;
    const path_parts = prefix.split('/').filter((p) => p !== '');
    const dirname = path_parts[path_parts.length - 1];
    const selected_path_parts = [...[dirname], ...props.path.split('/')];
    const open_dirs = {};
    do {
      selected_path_parts.pop();
      open_dirs[selected_path_parts.join('/')] = true;
    } while(selected_path_parts.length);
    this.state = {open_dirs}
  }

  get_file_tree(parts_array, progress=[]) {
    const first_part = parts_array[0][0];
    progress.push(first_part);
    const truncated = [...parts_array].map((i) => i.splice(1));
    const sorted = truncated.sort((a, b) => {
      const A = a[0];
      const B = b[0];
      const AL = a.length;
      const BL = b.length;
      if ((AL > 1 && BL > 1) || (AL === 1 && BL === 1)) { // both are directories
        if (A < B) {
          return -1;
        } else if (A > B) {
          return 1;
        } else {
          return 0;
        }
      } else { // one is directory another is not
        if (AL.length > 1) {
          return -1;
        } else {
          return 1;
        }
      }
    });

    const taboo = {};

    return {
      dirname: first_part,
      id: progress.join('/'),
      children: truncated.filter((c) => c.length !== 0).map((child) => {
        if (taboo[child[0]]) {
          return false;
        }

        if (child.length > 1) {
          const filtered = [...truncated].filter(([f]) => f === child[0]);
          taboo[child[0]] = true;
          return this.get_file_tree(filtered, [...progress]);
        } else if (child.length === 1) {
          const progress_parts = [...progress, child[0]];
          return {
            filename: child[0],
            path: progress_parts.slice(1, progress_parts.length).join('/'),
            id: progress_parts.join('/'),
          }
        }
      }).filter((s) => !!s),
    }
  }

  toggle_collapse(folder) {
    this.setState({
      open_dirs: {
        ...this.state.open_dirs,
        [folder]: !Boolean(this.state.open_dirs[folder]),
      }
    });
  }

  on_click_filename(tree) {
    this.props.history.push(`/browse/${tree.path}`);
  }

  render_folder_button({tree, depth, open}) {
    const ListItem = this.props.ListItemComponent;
    const ListItemIcon = this.props.ListItemIconComponent;
    const FolderIcon = this.props.FolderIconComponent;
    const depth_style = {paddingLeft: `${depth * 10}px`};
    const ListItemText = this.props.ListItemTextComponent;
    return (
      <ListItem onClick={() => this.toggle_collapse(tree.id)} button>
        <ListItemIcon style={depth_style}>
          <FolderIcon className={classnames({[this.props.classes.folder_icon_expanded]: open})} />
        </ListItemIcon>
        <ListItemText primary={tree.dirname} />
      </ListItem>
    );
  }

  render_file_button({tree, key, depth}) {
    const ListItem = this.props.ListItemComponent;
    const ListItemIcon = this.props.ListItemIconComponent;
    const FileIcon = this.props.FileIconComponent;
    const depth_style = {paddingLeft: `${depth * 10}px`};
    const ListItemText = this.props.ListItemTextComponent;
    return (
      <ListItem
        className={classnames({[this.props.classes.selected_file]: this.get_selected_path() === tree.id})}
        key={key}
        onClick={() => this.on_click_filename(tree)}
        button
      >
        <ListItemIcon style={depth_style}>
          <FileIcon />
        </ListItemIcon>
        <ListItemText primary={tree.filename} />
      </ListItem>
    );
  }

  render_file_hierarchy(tree, depth=0, i="root") {
    const List = this.props.ListComponent;
    const Collapse = this.props.CollapseComponent;
    if (tree.dirname && tree.children.length) {
      const next_depth = depth + 1;
      const open = this.state.open_dirs[tree.id];
      return (
        <List className={this.props.classes.list} component="nav" key={`file-tree-${depth}-${i}`}>
          {this.render_folder_button({tree, depth, open})}
          <Collapse in={open}>
            {tree.children.map((child, i) => this.render_file_hierarchy(child, next_depth, i))}
          </Collapse>
        </List>
      );
    }
    return this.render_file_button({
      tree,
      key: `file-tree-${depth}-${i}`,
      depth,
    });
  }

  render() {
    const prefix = this.props.report.filename_prefix;
    const folder = prefix.trim() !== '' ? path.basename(prefix) : this.props.title;
    const filenames = this.props.report.short_filenames;
    const filename_parts = filenames
      .map((s) => s.split('/'))
      .map((s) => s[0].trim() === '' ? s.splice(1) : s)
      .filter((s) => s.join('').trim() !== '')
      .map((s) => [folder, ...s]);
    const tree = this.get_file_tree(filename_parts);

    return (
      <div className={classnames(s.navigation_wrapper, this.props.classes.root)}>
        {this.render_file_hierarchy(tree)}
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(CollapsibleTree));
