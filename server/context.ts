import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'server', 'workspaces.json');

const getDefaultBaseDir = () => {
  if (process.env.FILE_DIR && existsSync(process.env.FILE_DIR)) {
    return process.env.FILE_DIR as string;
  }

  const possibleDirs = [process.env.USERPROFILE, process.env.HOME, process.cwd()].filter(Boolean);

  for (const dir of possibleDirs) {
    if (existsSync(dir as string)) {
      return dir as string;
    }
  }
  return process.cwd();
};

type State = {
  workspaces: string[];
  active: string | null;
};

let state: State = { workspaces: [], active: null };

const ensureStateFile = async () => {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    if (!existsSync(STATE_FILE)) {
      await fs.writeFile(STATE_FILE, JSON.stringify({ workspaces: [], active: null }, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to ensure workspace state file:', err);
  }
};

const loadState = async () => {
  try {
    await ensureStateFile();
    const raw = await fs.readFile(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as State;
    state = {
      workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [],
      active: parsed.active || null,
    };
  } catch (err) {
    // fallback to default
    state = { workspaces: [], active: null };
  }
};

const persistState = async () => {
  try {
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist workspace state:', err);
  }
};

// initialize
loadState();

const DEFAULT = getDefaultBaseDir();

export const getWorkspaces = () => state.workspaces.slice();

export const addWorkspace = async (p: string) => {
  const resolved = path.resolve(p);
  const stat = await fs.stat(resolved);
  if (!stat.isDirectory()) throw new Error('Path is not a directory');
  if (!state.workspaces.includes(resolved)) {
    state.workspaces.push(resolved);
    await persistState();
  }
  return state.workspaces.slice();
};

export const removeWorkspace = async (p: string) => {
  const resolved = path.resolve(p);
  state.workspaces = state.workspaces.filter((w) => w !== resolved);
  if (state.active === resolved) state.active = null;
  await persistState();
  return state.workspaces.slice();
};

export const getBaseDir = () => {
  if (state.active) return state.active;
  return DEFAULT;
};

export const setBaseDir = async (baseDir: string) => {
  const resolved = path.resolve(baseDir);
  const stat = await fs.stat(resolved);
  if (!stat.isDirectory()) {
    throw new Error('Path is not a directory');
  }
  // ensure in workspaces list
  if (!state.workspaces.includes(resolved)) {
    state.workspaces.push(resolved);
  }
  state.active = resolved;
  await persistState();
  return state.active;
};

export const getActiveWorkspace = () => state.active;

export default {
  getBaseDir,
  setBaseDir,
  getWorkspaces,
  addWorkspace,
  removeWorkspace,
  getActiveWorkspace,
};
