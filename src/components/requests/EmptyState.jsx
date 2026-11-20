export default function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {Icon && (
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </span>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {children && <div className="max-w-xs text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
