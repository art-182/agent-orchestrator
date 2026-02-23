const RealtimeIndicator = () => (
  <div className="flex items-center gap-2.5 px-2 py-1.5">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-terminal/60 animate-pulse-dot" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal" />
    </span>
    <span className="text-[10px] text-muted-foreground/70 tracking-[0.15em] uppercase font-medium">
      Conectado
    </span>
  </div>
);

export default RealtimeIndicator;
