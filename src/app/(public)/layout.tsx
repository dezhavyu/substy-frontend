export default function PublicLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <main className="flex min-h-screen items-center justify-center px-4 py-8">{children}</main>;
}
