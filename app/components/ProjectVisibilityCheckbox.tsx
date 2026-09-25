'use client';

interface ProjectVisibilityCheckboxProps {
  projectId: string;
  initialChecked: boolean;
}

export default function ProjectVisibilityCheckbox({
  projectId,
  initialChecked,
}: ProjectVisibilityCheckboxProps) {
  return (
    <>
      <input type="hidden" name="projectId" value={projectId} />
      <input
        type="checkbox"
        name="showOnProfile"
        defaultChecked={initialChecked}
        onChange={(e) => {
          // Auto-submit the form when toggled for better UX
          e.target.form?.requestSubmit();
        }}
        className="h-4 w-4 accent-orange-500"
      />
    </>
  );
}
