import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import Link from 'next/link';
import FileTree from '@/app/components/FileTree';
import { ArrowLeft, Home, FileText } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FolderPageProps {
  params: Promise<{
    username: string;
    projectSlug: string;
    path: string[];
  }>;
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    md: 'markdown',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    txt: 'text',
  };
  return map[ext] || 'text';
}

export default async function ProjectPathPage({ params }: FolderPageProps) {
  const { username, projectSlug, path } = await params;
  const user = await getCurrentUser();

  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      owner: { username },
    },
    include: {
      owner: { select: { username: true, id: true } },
      files: { orderBy: { updatedAt: 'desc' } },
    },
  });

  if (!project) notFound();

  const isOwnerOrContributor =
    user?.id === project.ownerId ||
    user?.role === 'admin' ||
    project.contributors?.some((c: any) => c.id === user?.id);

  if (!project.isPublic && !isOwnerOrContributor) {
    notFound();
  }

  const isOwner = user?.id === project.ownerId;
  const fullPath = path.join('/');

  const file = project.files.find((f) => f.name === fullPath);

  // ==================== FILE VIEWER ====================
  if (file) {
    const fileContent = file.content || (file.path ? 'File stored on disk (preview not available)' : null);
    const language = getLanguageFromFilename(file.name);

    return (
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="mb-6">
          <Link
            href={`/${username}/${projectSlug}/files`}
            className="inline-flex items-center gap-2 text-sm text-orange-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Files
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-6 w-6 text-orange-400" />
          <h1 className="text-2xl font-semibold tracking-tight">{file.name}</h1>
          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {language}
          </span>
        </div>

        <div className="text-sm text-zinc-500 mb-6">
          {file.size ? `${Math.round(file.size / 1024)} KB` : ''} • Last updated {new Date(file.updatedAt).toLocaleDateString()}
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          {fileContent ? (
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1.25rem',
                background: 'transparent',
                fontSize: '0.875rem',
              }}
              showLineNumbers={true}
            >
              {fileContent}
            </SyntaxHighlighter>
          ) : (
            <div className="p-6 text-zinc-400 italic">No preview available for this file type.</div>
          )}
        </div>

        <div className="mt-6 text-xs text-zinc-500">
          Full path: {file.name}
        </div>
      </div>
    );
  }

  // ==================== FOLDER VIEW ====================
  const folderPath = fullPath;
  const filteredFiles = project.files.filter((f) =>
    f.name.startsWith(folderPath + '/') || f.name === folderPath
  );

  const breadcrumbs = [
    { label: 'Files', href: `/${username}/${projectSlug}/files` },
    ...path.map((segment, index) => ({
      label: segment,
      href: `/${username}/${projectSlug}/files/${path.slice(0, index + 1).join('/')}`,
    })),
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-8">
        <Link
          href={`/${username}/${projectSlug}`}
          className="inline-flex items-center gap-2 text-sm text-orange-600 hover:underline mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to project
        </Link>

        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
          <Link href={`/${username}/${projectSlug}/files`} className="hover:text-orange-500 flex items-center gap-1">
            <Home className="h-4 w-4" /> Files
          </Link>
          {path.length > 0 && path.map((segment, index) => (
            <span key={index} className="flex items-center gap-2">
              <span>/</span>
              <Link
                href={`/${username}/${projectSlug}/files/${path.slice(0, index + 1).join('/')}`}
                className="hover:text-orange-500"
              >
                {segment}
              </Link>
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          {path.length > 0 ? path[path.length - 1] : 'Files'}
        </h1>
        <p className="text-zinc-500 mt-1">
          {filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'} in this folder
        </p>
      </div>

      <div className="mb-6">
        <FileTree
          files={filteredFiles.map(f => ({
            name: f.name,
            size: f.size || undefined,
            updatedAt: f.updatedAt,
            id: f.id,
          }))}
          isOwner={isOwner}
          basePath={`/${username}/${projectSlug}/files`}
          onDelete={async (fileId: string) => {
            'use server';
            const { deleteProjectFile } = await import('@/app/actions/files');
            await deleteProjectFile(fileId, project.slug);
          }}
        />
      </div>

      <div className="flex gap-4 text-sm">
        <Link
          href={`/${username}/${projectSlug}/files`}
          className="text-orange-600 hover:underline"
        >
          ← Back to root
        </Link>
      </div>
    </div>
  );
}
