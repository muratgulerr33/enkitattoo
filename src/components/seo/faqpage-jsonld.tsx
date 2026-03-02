type FaqPageJsonLdItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqPageJsonLdProps = {
  pageUrl: string;
  items: FaqPageJsonLdItem[];
};

function toPlainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function FaqPageJsonLd({ pageUrl, items }: FaqPageJsonLdProps) {
  const mainEntity = items
    .map((item) => ({
      question: toPlainText(item.question),
      answer: toPlainText(item.answer),
    }))
    .filter((item) => item.question.length > 0 && item.answer.length > 0)
    .slice(0, 12)
    .map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    }));

  if (!mainEntity.length) {
    return null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: pageUrl,
    mainEntity,
  } as const;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
