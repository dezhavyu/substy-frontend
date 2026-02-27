import { PropsWithChildren } from "react";

interface PageContainerProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function PageContainer({ title, description, children }: PageContainerProps): JSX.Element {
  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
