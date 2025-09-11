import { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@repo/ui/components/ui/card'
import { competitors } from '../../../data/competitors'
import { Badge } from '@repo/ui/components/ui/badge'
import CompareHome from './_components/compare-home'

interface FeatureComparison {
  category: string
  features: {
    name: string
    ExplainX: boolean | string | string[]
    competitor: boolean | string | string[]
    description?: string
  }[]
}

interface Competitor {
  name: string
  shortDescription: string
  category: string
  comparisonImage: string
  features: FeatureComparison[]
}

export const metadata: Metadata = {
  title: 'ExplainX: AI Learning Platform for the Next Generation',
  description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
  openGraph: {
    title: 'ExplainX: AI Learning Platform for the Next Generation',
    description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
    type: 'website',
    images: [
      {
        url: '/og-compare.jpg',
        width: 1200,
        height: 630,
        alt: 'explainx.ai comparison'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExplainX: AI Learning Platform for the Next Generation',
    description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
    images: ['/og-compare.jpg']
  },
  alternates: {
    canonical: 'https://www.explainx.ai/compare'
  }
}

export default function Page() {
  return (
  <>
  <CompareHome />
  </>
  )
}