import {spawn} from 'child_process';
import path from 'path';
import webpack from 'webpack';
import browserSync from 'browser-sync';
import fallback from 'connect-history-api-fallback';
import {REACT_CONFIG} from '../../webpack.config';

const bs = browserSync.create('Dev Server');

const init_bs = () => {
  bs.init({
    logLevel: "debug",
    open: false,
    server: {
      baseDir: path.resolve(__dirname),
      middleware: [fallback()]
    }
  });
}

bs.notify('Initializing...');
const compiler = webpack(REACT_CONFIG);
let electronChildProcess = null;

const watching = compiler.watch({}, (err, stats) => {
  if (err) {
    console.log(err);
  }

  if (!electronChildProcess) {
    const rootDir = path.resolve(__dirname, '..');
    const electronBin = path.resolve(__dirname, '..', 'node_modules', '.bin', 'electron');
    electronChildProcess = spawn(electronBin, [rootDir, 'path/to/report.json'], {
      stdio: 'inherit',
      env: process.env,
      cwd: process.cwd(),
    });
  }

  if (!bs.active) {
    init_bs();
  }

  if (stats && typeof stats.toString === 'function') {
    console.log(stats.toString({ colors: true }));
  }

  bs.notify('Build Complete... Reloading');
  bs.reload();
});

process.on('exit', () => {
  if (bs.active) {
    bs.exit();
  }
});