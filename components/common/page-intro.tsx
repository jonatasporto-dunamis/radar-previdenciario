type PageIntroProps = {
  title: string;
  description: string;
};

export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <section
      aria-labelledby="page-title"
      className="px-page mx-auto flex min-h-[calc(100svh-10rem)] w-full max-w-5xl items-center py-16 sm:py-20"
    >
      <div className="max-w-3xl">
        <p className="text-muted-foreground mb-4 text-sm font-medium uppercase">
          Radar Previdenciário
        </p>
        <h1
          id="page-title"
          className="text-foreground text-4xl leading-tight font-semibold sm:text-5xl"
        >
          {title}
        </h1>
        <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-7 sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
