const RealtimeIndicator = () => (
  <div className="flex items-center gap-2 px-3 py-2">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-terminal animate-pulse-dot" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal" />
    </span>
    <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
      Realtime
    </span>
  </div>
);

export default RealtimeIndicator;