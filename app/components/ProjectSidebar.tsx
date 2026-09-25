interface ProjectSidebarProps {
  project: any;
  files: any[];
}

export default function ProjectSidebar({ project, files }: ProjectSidebarProps) {
  // Only count programming languages
  const languageCounts: Record<string, number> = {};
  files.forEach(f => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext) {
      const lang = getLanguageFromExtension(ext);
      if (lang) {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      }
    }
  });

  const sortedLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const contributorSet = new Set<string>();
  contributorSet.add(project.owner.username);

  return (
    <div className="space-y-6">
      {/* About / Stats */}
      <div>
        <h3 className="font-semibold text-sm mb-2 text-zinc-500 dark:text-zinc-400">About</h3>
        <div className="text-sm space-y-1">
          <div>Releases: <span className="text-zinc-400">—</span></div>
          <div>Packages: <span className="text-zinc-400">—</span></div>
        </div>
      </div>

      {/* Contributors */}
      <div>
        <h3 className="font-semibold text-sm mb-2">Contributors</h3>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {project.owner.username} (owner)
          <div className="text-xs text-zinc-400 mt-1">+ more from activity</div>
        </div>
      </div>

      {/* Languages */}
      <div>
        <h3 className="font-semibold text-sm mb-2">Languages</h3>
        {sortedLanguages.length > 0 ? (
          <div className="space-y-1 text-sm">
            {sortedLanguages.map(([lang, count]) => (
              <div key={lang} className="flex justify-between">
                <span>{lang}</span>
                <span className="text-zinc-400">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-zinc-400">No code files yet</div>
        )}
      </div>
    </div>
  );
}

function getLanguageFromExtension(ext: string): string | null {
  const map: Record<string, string> = {
    // Programming languages only
    js: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript',
    jsx: 'JavaScript',
    py: 'Python',
    rb: 'Ruby',
    go: 'Go',
    rs: 'Rust',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    cs: 'C#',
    php: 'PHP',
    swift: 'Swift',
    kt: 'Kotlin',
    scala: 'Scala',
    dart: 'Dart',
    r: 'R',
    sql: 'SQL',
  };

  return map[ext] || null;
}
