import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import IconButton from '@material-ui/core/IconButton';

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const styles = theme => ({
  root: {
    borderRadius: '0',
  },
  table: {
    minWidth: 700,
  },
  row: {
    height: 36,
    cursor: 'pointer',
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  good_grade_text: {
    color: 'rgb(0, 255, 0)',
  },
  awry_grade_text: {
    color: 'rgb(255, 255, 0)',
  },
  bad_grade_text: {
    color: 'rgb(255, 0, 0)',
  }
});

const get_percent_color = (percent) => {
  let color = 'good';
  if (0.75 <= percent && percent < 0.95) {
    color = 'awry';
  } else if (percent < 0.75) {
    color = 'bad';
  }
  return color;
}

const get_file_coverage_grade = ({covered, count}) => {
  const percent = covered / count;
  return get_percent_color(percent);
}

const get_percent_covered = (classes, covered, count) => {
  const percent = covered / count;
  return (
    <span className={classes[`${get_percent_color(percent)}_grade_text`]}>
      {(percent * 100).toString().substring(0, 5)}%
    </span>
  );
}

const get_graded_text = (classes, text, grade) => {
  return (
    <span className={classes[`${grade}_grade_text`]}>
      {text}
    </span>
  );
}

const render_summary_row = ({summary, filename, key, onClick, classes}) => {
  const {
    functions,
    instantiations,
    lines,
    regions
  } = summary;
  const functions_grade = get_file_coverage_grade(functions);
  const instantiations_grade = get_file_coverage_grade(instantiations);
  const lines_grade = get_file_coverage_grade(lines);
  const regions_grade = get_file_coverage_grade(regions);

  const cols = [
    // Filename
    filename,
    // // Regions
    // regions.count,
    // // Missed Regions
    // get_graded_text(classes, regions.count - regions.covered, regions_grade),
    // // Cover
    // get_percent_covered(classes, regions.covered, regions.count),
    // // Functions
    // functions.count,
    // // Missed Functions
    // get_graded_text(classes, functions.count - functions.covered, functions_grade),
    // // Executed
    // get_percent_covered(classes, functions.covered, functions.count),
    // Lines
    lines.count,
    // Missed Lines
    get_graded_text(classes, lines.count - lines.covered, lines_grade),
    // Cover
    get_percent_covered(classes, lines.covered, lines.count),
  ]

  return (
    <TableRow className={classes.row} hover={true} key={key} onClick={onClick}>
      {cols.map((col, i) =>  (
        <CustomTableCell key={`coverage-row-${i}`} align={i === 0 ? null : 'right'}>{col}</CustomTableCell>
      ))}
    </TableRow>
  );
}


const CoverageToolbar = (props) => (
  <Toolbar>
    <div>
      <Typography variant="h6" id="tableTitle">
        TOTAL COVERAGE: {get_percent_covered(
          props.classes,
          props.report.summary.totals.lines.covered,
          props.report.summary.totals.lines.count
        )}
      </Typography>
    </div>
  </Toolbar>
);

function CoverageSummary(props) {
  const {classes} = props;
  const {filenames, short_filenames, summary} = props.report;
  const short_names_by_abs = {};
  short_filenames.forEach((s, i) => short_names_by_abs[filenames[i]] = s);
  return (
    <Paper className={classes.root}>
      <CoverageToolbar report={props.report} classes={props.classes} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow className={classes.row}>
            <CustomTableCell>Filename</CustomTableCell>
            <CustomTableCell align="right">Lines</CustomTableCell>
            <CustomTableCell align="right">Missed Lines</CustomTableCell>
            <CustomTableCell align="right">Cover</CustomTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summary.files.map(({filename, summary}, i) => {
            return render_summary_row({
              summary,
              filename: short_names_by_abs[filename],
              key: `coverage-row-body-${i}`,
              onClick: (e) => (props.onClick ? props.onClick(short_names_by_abs[filename], e) : null),
              classes,
            });
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}

CoverageSummary.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CoverageSummary);
