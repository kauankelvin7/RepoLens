type RepoLensMarkProps = {
  className?: string;
};

export function RepoLensMark({ className = "" }: RepoLensMarkProps) {
  const classes = ["repolens-mark", className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false" role="presentation">
        <circle className="mark-lens" cx="10" cy="10" r="6.35" />
        <path className="mark-handle" d="m14.7 14.7 4.8 4.8" />

        <path
          className="mark-branch"
          d="M7.4 6.8v6.05c0 1.05.85 1.9 1.9 1.9h1.05"
        />
        <path
          className="mark-branch"
          d="M7.4 9.15h2.1c1.55 0 2.7-.95 2.7-2.35"
        />

        <circle className="mark-node" cx="7.4" cy="6.4" r="1" />
        <circle className="mark-node" cx="7.4" cy="13.1" r="1" />
        <circle className="mark-node" cx="12.2" cy="6.4" r="1" />
      </svg>
    </span>
  );
}
