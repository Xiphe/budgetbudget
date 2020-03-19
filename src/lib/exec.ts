import { exec } from 'child_process';

export default window.require('electron').remote.require('child_process')
  .exec as typeof exec;
