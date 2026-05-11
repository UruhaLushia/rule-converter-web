interface ErrorAlertProps {
  error: string | null;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;
  return (
    <div className="rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      {error}
    </div>
  );
}
