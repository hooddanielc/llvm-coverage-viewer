import {JSDOM} from 'jsdom';
const dom = new JSDOM(`<!DOCTYPE html>`);
export default dom;
export const window = dom.window;
export const document = dom.window.document;
