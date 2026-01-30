interface LoadingProps {
  message?: string
  className?: string
}

export function Loading({ message = "Carregando...", className = "" }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <img src="/loading-whizpic.gif" alt="Carregando" className="h-16 w-16" />
      {message && <p className="text-muted-foreground">{message}</p>}
    </div>
  )
}

