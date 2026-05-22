export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 bg-tesla-gradient" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-tesla-red/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-tesla-blue/10 blur-3xl" />
      {children}
    </div>
  );
}
