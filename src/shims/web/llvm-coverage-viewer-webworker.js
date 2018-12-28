/* global Worker */
const Worker = typeof window !== 'undefined' ? window.Worker : null;
export default Worker;
