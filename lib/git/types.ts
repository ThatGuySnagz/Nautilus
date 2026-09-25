/**
 * Git Feature Types
 * 
 * These types correspond to the Git models in Prisma.
 * Use these instead of raw Prisma types when possible for better type safety.
 */

export type GitRepository = {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  defaultBranch: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Branch = {
  id: string;
  repositoryId: string;
  name: string;
  headCommitId: string | null;
  createdAt: Date;
};

export type Commit = {
  id: string;
  repositoryId: string;
  branchId: string | null;
  authorId: string | null;
  message: string;
  treeSha: string;
  parentSha: string | null;
  createdAt: Date;
};

export type TreeEntry = {
  id: string;
  commitId: string;
  path: string;
  kind: 'blob' | 'tree';
  mode: string;
  blob: string | null;
  size: number | null;
  sha: string | null;
};

export type PullRequest = {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  description: string | null;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'closed' | 'merged';
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  mergedAt: Date | null;
};

export type GitIssue = {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  description: string | null;
  status: 'open' | 'closed';
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GitLabel = {
  id: string;
  name: string;
  color: string;
};

export type GitMilestone = {
  id: string;
  title: string;
  dueDate: Date | null;
};
