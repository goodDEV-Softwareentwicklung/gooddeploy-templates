import * as migration_20261127_122933_initial from './20261127_122933_initial';
import * as migration_20261127_160631_drafts_live_preview from './20261127_160631_drafts_live_preview';
import * as migration_20261127_181424_site_mcp from './20261127_181424_site_mcp';

export const migrations = [
  {
    up: migration_20261127_122933_initial.up,
    down: migration_20261127_122933_initial.down,
    name: '20261127_122933_initial',
  },
  {
    up: migration_20261127_160631_drafts_live_preview.up,
    down: migration_20261127_160631_drafts_live_preview.down,
    name: '20261127_160631_drafts_live_preview',
  },
  {
    up: migration_20261127_181424_site_mcp.up,
    down: migration_20261127_181424_site_mcp.down,
    name: '20261127_181424_site_mcp',
  },
];
