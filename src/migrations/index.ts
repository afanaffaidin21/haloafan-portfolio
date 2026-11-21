import * as migration_20261121_112533_initial from './20261121_112533_initial';

export const migrations = [
  {
    up: migration_20261121_112533_initial.up,
    down: migration_20261121_112533_initial.down,
    name: '20261121_112533_initial'
  },
];
