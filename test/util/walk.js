import fs from 'fs';
import {promisify} from 'util';
import path from 'path';

const read_file = promisify(fs.readFile);
const read_dir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export const walk = async (dir, filelist = []) => {
  const files = await read_dir(dir);

  for (let file of files) {
    const filepath = path.join(dir, file);
    const file_stat = await stat(filepath);

    if (file_stat.isDirectory()) {
      filelist = await walk(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  }

  return filelist;
}

export default walk;
