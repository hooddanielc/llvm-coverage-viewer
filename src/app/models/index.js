import fs from '/@/app/util/fs';
import PropTypes from 'prop-types';
import ObjectHash from 'object-hash';
import IntervalTree from 'node-interval-tree';

class LogInterceptor {
  constructor(props) {
    this.props = props;
    this.original = props.original || console[props.type];
    this.interceptor = (...args) => this.intercept(...args);
    this.logs = [];
  }

  intercept(...args) {
    this.logs.push(args);
    this.original.apply(console, args);
  }

  enable() {
    console[this.props.type] = this.interceptor;
  }

  disable() {
    console[this.props.type] = this.original;
  }

  clear() {
    const result = this.logs;
    this.logs = [];
    return result;
  }
}

const Model = (() => {
  const log_interceptor = new LogInterceptor({type: 'log'});
  const warn_interceptor = new LogInterceptor({type: 'warn'});
  const error_interceptor = new LogInterceptor({type: 'error'});

  const enable_interceptors = () => {
    log_interceptor.enable();
    warn_interceptor.enable();
    error_interceptor.enable();
  }

  const disable_interceptors = () => {
    log_interceptor.disable();
    warn_interceptor.disable();
    error_interceptor.disable();
  }

  return class Model extends Object {
    static get defaultProps() {
      return {}
    }

    static get propTypes() {
      return {};
    }

    /* return a hash that can be used for checking equality */
    get hash() {
      return ObjectHash(this.props);
    }

    constructor(props={}) {
      super(props);
      if (props) {
        this.props = Object.assign(
          {},
          this.constructor.defaultProps,
          props,
        );
        Object.keys(this.constructor.propTypes).forEach((k) => this[k] = this.props[k]);
      }
      this.validate();
    }

    validate_property(name) {
      enable_interceptors();
      PropTypes.checkPropTypes(this.constructor.propTypes, this.props, name, this.constructor.name);
      disable_interceptors();
      return {
        logs: log_interceptor.clear(),
        warns: warn_interceptor.clear(),
        errors: error_interceptor.clear(),
      }
    }

    validate() {
      if (this.constructor.propTypes) {
        Object.keys(this.constructor.propTypes).forEach((name) => {
          const {warns: warnings, errors} = this.validate_property(name);
          if (errors.length || warnings.length) {
            const obj = {}
            if (errors.length) {
              obj.errors = errors;
            }
            if (warnings.length) {
              obj.warnings = warnings;
            }
            const json = JSON.stringify(obj, null, 2)
              .split('\n')
              .join('\n|    ');
            const error = new Error(`proptype validation failed: \n${json}`);
            throw error;
          }
        });
      }
    }

    toJSON(key) {
      if (this instanceof Model) {
        const newobj = Object.assign({}, this);
        delete newobj.props;
        return newobj;
      } else if (typeof this.constructor.propTypes[key] === 'undefined') {
        return undefined;
      }
      return this;
    }
  }
})();

class LineInfo extends Model {
  static get propTypes() {
    return {
      length: PropTypes.number.isRequired,
      start: PropTypes.number.isRequired,
      line_number: PropTypes.number.isRequired,
      line_src: PropTypes.string.isRequired,
    }
  }
}

class Region extends Model {
  static get propTypes() {
    return {
      line_start: PropTypes.number.isRequired,
      column_start: PropTypes.number.isRequired,
      line_end: PropTypes.number.isRequired,
      column_end: PropTypes.number.isRequired,
      execution_count: PropTypes.number.isRequired,
      file_id: PropTypes.number.isRequired,
      expanded_file_id: PropTypes.number.isRequired,
      kind: PropTypes.number.isRequired,
      filename: PropTypes.string.isRequired,
    }
  }

  constructor(props) {
    super(props);
  }
}

class Interval extends Model {
  static get propTypes() {
    return {
      region: PropTypes.instanceOf(Region),
      from: PropTypes.number.isRequired,
      to: PropTypes.number.isRequired,
    }
  }
}

class FunctionCoverage extends Model {
  static get defaultProps() {
    return {
      filenames: [],
      regions: [],
    }
  }

  static get propTypes() {
    return {
      filenames: PropTypes.arrayOf(PropTypes.string).isRequired,
      regions: PropTypes.arrayOf(PropTypes.instanceOf(Region)).isRequired,
    }
  }

  constructor(props) {
    super(props);
    this.added_regions = {};
    this.regions.forEach((r) => this.add_region(r));
  }

  add_region(region) {
    if (this.added_regions[region.hash]) {
      return;
    }
    this.added_regions[region.hash] = region;
    this.regions.push(region);
  }
}

class CoverageStats extends Model {
  static get propTypes() {
    return {
      count: PropTypes.number.isRequired,
      covered: PropTypes.number.isRequired,
      percent: PropTypes.number.isRequired,
      notCovered: PropTypes.number,
    }
  }
}

const NL_REGEX = /\r?\n/;

class File extends Model {
  static get defaultProps() {
    return {
      functions: [],
      regions: [],
    }
  }

  static get propTypes() {
    return {
      filename: PropTypes.string.isRequired,
      src: PropTypes.string.isRequired,
      functions: PropTypes.arrayOf(PropTypes.instanceOf(FunctionCoverage)),
      regions: PropTypes.arrayOf(PropTypes.instanceOf(Region)),
      summary: PropTypes.shape({
        functions: PropTypes.instanceOf(CoverageStats.propTypes).isRequired,
        instantiations: PropTypes.instanceOf(CoverageStats.propTypes).isRequired,
        lines: PropTypes.instanceOf(CoverageStats.propTypes).isRequired,
        regions: PropTypes.instanceOf(CoverageStats.propTypes),
      }),
    }
  }

  constructor(props) {
    super(props);
    this.added_regions = {};
    this.added_functions = {};
    this.functions.forEach((f) => this.functions[f.hash] = f);
    this.regions.forEach((r) => this.added_regions[r.hash] = r);
  }

  get src() {
    return this._src;
  }

  set src(src) {
    this._src = src;
    this.lines = [];
    this.line_info = {};
    let length = 0;
    const split_lines = src.split(NL_REGEX);
    split_lines.forEach((line_src, i) => {
      const line_number = i + 1;
      const info = new LineInfo({
        start: length,
        length: line_src.length + 1,
        line_number,
        line_src,
      });
      this.line_info[i + 1] = info;
      this.lines.push(info);
      length += info.length;
    });
  }

  get_line_coverage_info(line_number) {
    const {start, length, line_src} = this.line_info[line_number];
    const end = start + line_src.length;

    if (length <= 1) {
      return {
        start,
        end,
        intervals: [],
        line_number,
      }
    }

    const intervals = this.query_tree(start, start + line_src.length);

    intervals.sort((a, b) => {
      const A = a.to - a.from;
      const B = b.to - b.from;
      const AC = a.region.execution_count;
      const BC = b.region.execution_count;
      if (A < B) {
        return -1;
      } else if (A > B) {
        return 1;
      } else if (AC < BC) {
        return -1;
      } else if (AC > BC) {
        return 1;
      } else {
        return 0;
      }
    });

    return {
      line_number,
      start,
      end: start + line_src.length,
      intervals,
    }
  }

  get_col_counts({src, coverage_rows}) {
    const result = [];
    for (let i = 0; i < src.length; ++i) {
      let found = false;
      for (let r = 0; r < coverage_rows.length; ++r) {
        const {start_index, end_index, region} = coverage_rows[r];
        if (start_index <= i && i < end_index) {
          result.push(region.execution_count);
          found = true;
          break;
        }
      }
      if (!found) {
        result.push(-1);
      } else {
        found = false;
      }
    }
    return result;
  }

  get_col_count_str({src, coverage_rows}) {
    let numbers = '';
    let number_counts = '';
    let last = '';

    const col_counts = this.get_col_counts({src, coverage_rows});
    for (let i = 0; i < col_counts.length; ++i) {
      let col_str = src.charAt(i).toString();
      let count_str = col_counts[i].toString();

      if (count_str !== last) {
        last = count_str;
      } else {
        count_str = '-';
      }

      if (count_str === '') {
        count_str += '?';
      }
      const max = Math.max(count_str.length + 1, col_str.length + 1);
      for (let n = col_str.length; n < max; ++n) {
        col_str += ' ';
      }
      for (let n = count_str.length; n < max; ++n) {
        count_str += ' ';
      }
      numbers += col_str;
      number_counts += count_str;
    }
    return `
      | ${numbers}
      | ${number_counts}
    `;
  }

  count_line_src(line_number) {
    if (!this.line_info[line_number]) {
      return [];
    }
    const {start, line_src} = this.line_info[line_number];
    const end = start + line_src.length;

    const intervals = this.query_tree(start, end).sort((a, b) => {
      const A = a.to - a.from;
      const B = b.to - b.from;
      if (A < B) {
        return -1;
      } else if (A > B) {
        return 1;
      } else {
        return 0;
      }
    });

    const result = [];
    let last_col_count = -1;
    let current_src = '';

    const pop_current_src = () => {
      if (current_src.length !== 0) {
        result.push({
          count: last_col_count,
          src: current_src,
        });
        current_src = '';
      }
    }

    for (let i = start; i < end; ++i) {
      let col_execution_count = -1;

      for (let y = 0; y < intervals.length; ++y) {
        const {from, to, region} = intervals[y];
        if (from - 1 <= i && i <= to) {
          col_execution_count = region.execution_count;
          break;
        }
      }
      if (last_col_count !== col_execution_count) {
        pop_current_src();
      }

      last_col_count = col_execution_count;
      current_src += line_src.charAt(i - start);
    }

    pop_current_src();
    return result;
  }

  add_region(region) {
    if (this.added_regions[region.hash]) {
      return;
    }
    this.regions.push(region);
    this.added_regions[region.hash] = region;
  }

  add_function(function_coverage) {
    if (this.added_functions[function_coverage.hash]) {
      return;
    }
    this.functions.push(function_coverage);
    this.added_functions[function_coverage.hash] = function_coverage;
  }

  initialize_interval_tree() {
    this.tree = new IntervalTree();
    this.regions.forEach((region) => {
      const {line_start, column_start, line_end, column_end} = region;
      if (line_start < this.line_info.length && line_end < this.line_info.length) {
        const start_index = this.line_info[line_start].start + column_start;
        const end_index = this.line_info[line_end].start + column_end;

        const interval = new Interval({
          region,
          from: start_index,
          to: end_index,
        });
        this.tree.insert(start_index, end_index, interval);
      }
    });
    return this.tree;
  }

  query_tree(start, end) {
    if (!this.tree) {
      this.tree = this.initialize_interval_tree();
    }
    return this.tree.search(start, end);
  }
}

export const serialize_region = (region) => ({
  line_start: region[0],
  column_start: region[1],
  line_end: region[2],
  column_end: region[3],
  execution_count: region[4],
  file_id: region[5],
  expanded_file_id: region[6],
  kind: region[7],
});

class Report extends Model {
  static get defaultProps() {
    return {
      files: [],
      totals: {},
    }
  }

  static get propTypes() {
    return {
      // llvm json document
      report: PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.shape({
          files: PropTypes.arrayOf(PropTypes.shape({
            filename: PropTypes.string.isRequired,
            summary: PropTypes.shape({
              functions: PropTypes.shape(CoverageStats.propTypes).isRequired,
              instantiations: PropTypes.shape(CoverageStats.propTypes).isRequired,
              lines: PropTypes.shape(CoverageStats.propTypes).isRequired,
              regions: PropTypes.shape(CoverageStats.propTypes),
            }).isRequired,
          })).isRequired,

          totals: PropTypes.shape({
            functions: PropTypes.shape(CoverageStats.propTypes).isRequired,
            instantiations: PropTypes.shape(CoverageStats.propTypes).isRequired,
            lines: PropTypes.shape(CoverageStats.propTypes).isRequired,
            regions: PropTypes.shape(CoverageStats.propTypes).isRequired,
          }).isRequired,
        })),
      }),

      // wrapped objects
      files: PropTypes.arrayOf(PropTypes.instanceOf(File)),
      totals: PropTypes.shape({
        functions: PropTypes.instanceOf(CoverageStats),
        instantiations: PropTypes.instanceOf(CoverageStats),
        lines: PropTypes.instanceOf(CoverageStats),
        regions: PropTypes.instanceOf(CoverageStats),
      }),
    }
  }

  constructor(props) {
    super(props);
    const report = props.report.data[0];
    for (const file of report.files) {
      file.filename = file.filename.replaceAll('\\', '/');
      for (const expansion of file.expansions) {
        expansion.filenames = expansion.filenames.map((filename) => filename.replaceAll('\\', '/'));
      }
    }
    for (const fun of report.functions) {
      fun.filenames = fun.filenames.map((filename) => filename.replaceAll('\\', '/'));
    }
    this.report = report;
    // this.report_json = JSON.stringify(props.report);
  }

  get_summary() {
    const totals = this.report.totals;
    const files = this.report.files.map(({filename, summary}) => ({filename, summary}));
    return {totals, files}
  }

  get_filename_prefix() {
    const sorted_filenames = this.get_filenames().sort((a, b) => {
      const A = a.length;
      const B = b.length;
      if (A < B) {
        return 1;
      } else if (A > B) {
        return -1;
      } else {
        return 0;
      }
    });
    let common_prefix = sorted_filenames[0];
    const other_sorted_filenames = sorted_filenames.slice(1);
    for (const other_sorted_filename of other_sorted_filenames) {
      for (let i = 0; i < Math.min(other_sorted_filename.length, common_prefix.length); ++i) {
        if (common_prefix.charAt(i) !== other_sorted_filename.charAt(i)) {
          if (i == 0) common_prefix = "";
          else common_prefix = other_sorted_filename.substring(0, i);
          break;
        }
      }
      if (common_prefix === "") break;
    }
    return common_prefix;
  }

  get_raw_file_report(filename) {
    return this.report.files.filter(({filename: f}) => filename === f)[0] || null;
  }

  get_file_summary(filename) {
    const file_report = this.get_raw_file_report(filename);
    return file_report.summary;
  }

  get_filenames() {
    return this.report.files.map(({filename}) => filename);
  }

  get_short_filenames() {
    const common_prefix = this.get_filename_prefix();
    return this.get_filenames().map((filename) => filename.substring(common_prefix.length));
  }

  build_file(filename, src=null) {
    // add functions and regions relating to filename
    const file = this.initialize_file(filename, src);
    this.report.functions.forEach((fn) => {
      if (fn.filenames.indexOf(filename) === -1) {
        return;
      }
      const function_regions = [];
      fn.regions.forEach((raw_region) => {
        const region_props = serialize_region(raw_region);
        region_props.filename = fn.filenames[region_props.file_id];
        if (region_props.filename !== filename) {
          return;
        }
        const region = new Region(region_props);
        function_regions.push(region);
        file.add_region(region);
      });

      const function_coverage = new FunctionCoverage({
        regions: function_regions,
        filenames: fn.filenames,
      });
      file.add_function(function_coverage);
    });
    file.initialize_interval_tree();
    return file;
  }

  initialize_file(filename, with_src=null) {
    const src = with_src || fs.readFileSync(filename, 'utf8');
    return new File({src, filename});
  }
}

export default {
  LogInterceptor,
  Model,
  LineInfo,
  Region,
  Report,
}

export {
  LogInterceptor,
  Model,
  LineInfo,
  Region,
  Report,
}
