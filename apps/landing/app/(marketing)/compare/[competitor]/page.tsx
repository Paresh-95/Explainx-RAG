// apps/landing/app/(marketing)/compare/[competitor]/page.tsx

import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComparisonTableSkeleton } from '../_components/compare-skeleton';
import { ComparisonTable } from '../_components/compare-table';
import { Heading } from '../../../_components/heading';
import { Testimonials } from '../../../_components/testimonials';
import FAQs from '../../../_components/faq-section';
import { competitors } from '../../../../data/competitors';
import { ReviewsSection } from '../../../_components/reviews/reviews-section';
import { Pricing } from '../../../_components/explainx-pricing';
import { ComparisonStructuredData } from './StructuredData';
import { generateFAQsFromFeatures, generateReviews, getFeatureHighlights } from './utils';
import { plans } from '../../../../data/plans/pricing';
import { UserReviews } from '../_components/user-reviews';
import { ContentSection } from '../_components/content';

interface PageProps {
  params: Promise<{
    competitor: string;
  }>
}

export async function generateStaticParams() {
  return Object.keys(competitors).map(slug => ({
    competitor: slug
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const competitor = competitors[resolvedParams.competitor];
  
  if (!competitor) return {};

  const title = `ExplainX: AI Learning Platform for the Next Generation`;
  const description = `Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.`;
  const keywords = [competitor.name, 'explainx.ai', `${competitor.name} alternatives`, `free ${competitor.name} alternatives`, `influencer marketing platforms`, 'comparison', 'features', 'pricing', 'capabilities'];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{
        url: competitor.comparisonImage,
        width: 1200,
        height: 630,
        alt: `explainx.ai vs ${competitor.name} comparison`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [competitor.comparisonImage]
    },
    alternates: {
      canonical: `https://www.explainx.ai/compare/${resolvedParams.competitor}`
    }
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const resolvedParams = await params;
  const competitor = competitors[resolvedParams.competitor];
  
  if (!competitor) {
    notFound();
  }

  const faqs = generateFAQsFromFeatures(competitor);
  const reviews = generateReviews(competitor);
  const featureHighlights = getFeatureHighlights(competitor);

  return (
    <>
      <ComparisonStructuredData
        competitor={competitor}
        faqs={faqs}
        reviews={reviews}
        featureHighlights={featureHighlights}
      />
      
      <Heading
        title={`Explainx.ai vs ${competitor.name}`}
        subtitle={`Compare features, pricing, and capabilities between explainx.ai and ${competitor.name}`}
        image={competitor.comparisonImage}
        summaryTable={competitor.summaryTable}
        logo={competitor.logo}
        name={competitor.name}
      />
      
      <div className="">
        <Suspense fallback={<ComparisonTableSkeleton />}>
          <ComparisonTable competitor={competitor} />
        </Suspense>
        <ContentSection whatMakeDifferent={competitor.whatMakeDifferent} rightChoise={competitor.rightChoise} />
        <UserReviews userComparisons={competitor.userComparisons} competitorName={competitor.name} />
        <Testimonials />
        <ReviewsSection />
        <Pricing
          plans={plans}
          title="Simple, Transparent Pricing"
          description="Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support."
        />
        <FAQs faqs={faqs} />
      </div>
    </>
  );
}