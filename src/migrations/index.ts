import * as migration_20261121_112533_initial from './20261121_112533_initial';
import * as migration_20261124_043938_ai_notes from './20261124_043938_ai_notes';

export const migrations = [
  {
    up: migration_20261121_112533_initial.up,
    down: migration_20261121_112533_initial.down,
    name: '20261121_112533_initial',
  },
  {
    up: migration_20261124_043938_ai_notes.up,
    down: migration_20261124_043938_ai_notes.down,
    name: '20261124_043938_ai_notes'
  },
];
