import path from 'path';
import fs from 'fs';
import browserSync from 'browser-sync';
import fallback from 'connect-history-api-fallback';
import program from 'commander';
import pkg from '../../package.json';

program
  .version(pkg.version)
  .option('-d, --docs [file]', 'Serve generated one page app')
  .parse(process.argv);

if (!program.docs) {
  console.log('No doc file provided, showing demo grammar now.');
  program.docs = path.resolve(__dirname, '..', '..', 'test', 'fixtures');
} else {
  program.docs = path.join(process.cwd(), program.docs);
}

if (path.extname(program.docs) !== '.html') {
  const dirname = path.dirname(program.docs);
  const baseparts = path.basename(program.docs).split('.');

  if (baseparts.length) {
    baseparts.pop();
  }

  baseparts.push('html');
  program.docs = path.join(dirname, baseparts.join('.'));
}

if (!fs.existsSync(program.docs)) {
  throw new Error(program.docs);
}

const bs = browserSync.create('Coverge Viewer');

const init_bs = () => {
  bs.notify('Initializing...');
  const index = `/${path.basename(program.docs)}`;

  bs.init({
    startPath: index,
    server: {
      baseDir: path.dirname(program.docs),
      index,
      middleware: [fallback({index})],
      serveStaticOptions: {
        extensions: ["html", "js"]
      }
    }
  });
}

init_bs();

process.on('exit', () => {
  if (bs.active) {
    bs.exit();
  }
});
