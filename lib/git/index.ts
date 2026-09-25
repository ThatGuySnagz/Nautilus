export * from './types';

/**
 * Feature flag for Git functionality.
 * Set ENABLE_GIT_FEATURES=true in .env to enable GitHub/GitLab style features.
 */
export const isGitEnabled = () => {
  return process.env.ENABLE_GIT_FEATURES === 'true';
};
