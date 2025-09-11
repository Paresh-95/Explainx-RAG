import { Metadata } from 'next'
import Image from 'next/image'
import SearchProducts from './_components/search-products'
import productData from '../../../data/product-data'


export const metadata: Metadata = {
  title: 'ExplainX: AI Learning Platform for the Next Generation',
  description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
  openGraph: {
    title: 'ExplainX: AI Learning Platform for the Next Generation',
    description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
    images: ['/og-products.jpg']
  }
}

export default function ProductsHome() {
    return (
      <div className="container">
        <div className="flex flex-col items-center text-center py-16 md:py-24 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
            Supercharge Your Social Media with AI Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Discover our suite of AI-powered tools designed to enhance your social media presence and engagement
          </p>
        </div>
  
        <SearchProducts products={productData} />
      </div>
    )
  }