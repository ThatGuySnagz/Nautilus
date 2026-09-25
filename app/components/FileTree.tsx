'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, FolderOpen, File, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FileNode[];
  size?: number;
  updatedAt?: Date;
  id?: string;
}

interface FileTreeProps {
  files: Array<{
    name: string;
    size?: number;
    updatedAt?: Date;
    id?: string;
  }>;
  isOwner?: boolean;
  onDelete?: (fileId: string) => void;
  /** Base path for navigation, e.g. "/username/project-slug/files" */
  basePath?: string;
}

function countFilesInTree(node: FileNode): number {
  if (!node.isFolder) return 1;
  if (!node.children) return 0;
  return node.children.reduce((sum, child) => sum + countFilesInTree(child), 0);
}

function buildFileTree(files: FileTreeProps['files']): FileNode[] {
  const root: Record<string, any> = {};

  files.forEach((file) => {
    const parts = file.name.split('/').filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;

      if (!current[part]) {
        current[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          isFolder: !isLast,
          children: isLast ? undefined : {},
          size: isLast ? file.size : undefined,
          updatedAt: isLast ? file.updatedAt : undefined,
          id: isLast ? file.id : undefined,
        };
      }

      if (!isLast) {
        current = current[part].children;
      }
    });
  });

  const convertToArray = (obj: Record<string, any>): FileNode[] => {
    return Object.values(obj).map((node: any) => ({
      ...node,
      children: node.children ? convertToArray(node.children) : undefined,
    }));
  };

  return convertToArray(root);
}

function TreeNode({
  node,
  depth = 0,
  isOwner,
  onDelete,
  basePath,
}: {
  node: FileNode;
  depth?: number;
  isOwner?: boolean;
  onDelete?: (fileId: string) => void;
  basePath?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const fileCount = hasChildren ? countFilesInTree(node) : 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (node.isFolder) {
      // If folder has more than 3 files total, navigate to dedicated view
      if (fileCount > 3 && basePath) {
        router.push(`${basePath}/${node.path}`);
      } else {
        setIsOpen(!isOpen);
      }
    } else {
      // File clicked → navigate to file viewer
      if (basePath) {
        router.push(`${basePath}/${node.path}`);
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.id && onDelete) {
      onDelete(node.id);
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800 rounded cursor-pointer text-sm group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          )
        ) : (
          <span className="w-3.5" />
        )}

        {node.isFolder ? (
          isOpen ? (
            <FolderOpen className="h-4 w-4 text-orange-400" />
          ) : (
            <Folder className="h-4 w-4 text-orange-400" />
          )
        ) : (
          <File className="h-4 w-4 text-zinc-400" />
        )}

        <span className="text-zinc-200 truncate">{node.name}</span>

        {node.size && (
          <span className="ml-auto text-xs text-zinc-500">
            {Math.round(node.size / 1024)} KB
          </span>
        )}

        {isOwner && node.id && (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              depth={depth + 1}
              isOwner={isOwner}
              onDelete={onDelete}
              basePath={basePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ files, isOwner, onDelete, basePath }: FileTreeProps) {
  const tree = buildFileTree(files);

  if (tree.length === 0) {
    return <div className="text-sm text-zinc-400 px-2 py-4">No files yet.</div>;
  }

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900 py-2">
      {tree.map((node, index) => (
        <TreeNode
          key={index}
          node={node}
          isOwner={isOwner}
          onDelete={onDelete}
          basePath={basePath}
        />
      ))}
    </div>
  );
}
