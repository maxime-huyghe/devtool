import { SaveArgs } from './persistence/renderer'

// An object of this type is stored in VueX, and used in `main.ts`.
export type AutoSaveArgs = { save: true; args: SaveArgs } | { save: false }
