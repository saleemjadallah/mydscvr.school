interface LandingIntroProps {
  content: string;
}

export default function LandingIntro({ content }: LandingIntroProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div
        className="prose prose-gray max-w-3xl prose-headings:font-display prose-headings:text-gray-900 prose-a:text-[#FF6B35] prose-a:no-underline hover:prose-a:underline prose-li:marker:text-[#FF6B35]"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}
