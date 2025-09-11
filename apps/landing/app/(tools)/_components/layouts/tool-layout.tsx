import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { Tool } from '../../../../types/tools';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@repo/ui/components/ui/breadcrumb';
import { Button } from '@repo/ui/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ToolLayoutProps {
  tool: Tool;
  children: React.ReactNode;
}

export default function ToolLayout({ tool, children }: ToolLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/tools" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Tools
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
              {tool.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Modern Hero Section */}
      <div className="relative overflow-hidden rounded-lg">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-800/20 dark:to-purple-800/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-800/20 dark:to-pink-800/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center py-16 md:py-24">
          {/* Platform Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {tool.platform} Tool
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
            {tool.name}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            {tool.description}
          </p>

       

          {/* CTA Button */}
         <Link href={'#tool'}>
         <Button 
            size="lg" 
            
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full text-base font-medium shadow-lg border-0"
          >
            {tool.ctaText || 'Try Now'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
         </Link>
        </div>
      </div>

      {/* Main Tool Interface */}
      <div id="tool" className="mb-12">
        {children}
      </div>

      {/* Key Features */}
      <Card className="mb-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">★</span>
            </div>
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {tool.keyFeatures.map((feature, index) => (
              <div key={index} className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-blue-600 dark:text-blue-400 text-xl">★</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card className="mb-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            Use Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tool.useCase?.[0]?.title?.toLowerCase() || ''} className="w-full">
            <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {tool.useCase.map((useCase) => (
                <TabsTrigger 
                  key={useCase.title} 
                  value={useCase.title.toLowerCase()}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  {useCase.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {tool.useCase.map((useCase) => (
              <TabsContent 
                key={useCase.title} 
                value={useCase.title.toLowerCase()}
                className="mt-0"
              >
                <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{useCase.title}</h3>
                  <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{useCase.description}</p>
                  <ul className="space-y-4">
                    {useCase.examples.map((example, index) => (
                      <li key={index} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mt-0.5">
                          <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-200 leading-relaxed">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Pricing */}
      {/* {tool.pricing && (
        <Card className="mb-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">💰</span>
              </div>
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-lg font-bold">✓</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h3>
                </div>
                <ul className="space-y-4">
                  {tool.pricing.free?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-500 dark:text-green-400 text-lg">✓</span>
                      <span className="text-gray-700 dark:text-gray-200 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pro</h3>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{tool.pricing.price}</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  {tool.pricing.pro?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-500 dark:text-blue-400 text-lg">✓</span>
                      <span className="text-gray-700 dark:text-gray-200 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* FAQ */}
      <Card className="mb-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">❓</span>
            </div>
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {tool.faq.map((item, index) => (
              <div key={index} className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-start gap-3">
                  <span className="text-purple-500 dark:text-purple-400 text-lg">Q.</span>
                  {item.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex items-start gap-3">
                  <span className="text-green-500 dark:text-green-400 text-lg">A.</span>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card className="mb-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">👥</span>
            </div>
            Who Is This Tool For?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {tool.targetAudience.map((audience, index) => (
              <div key={index} className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-indigo-600 dark:text-indigo-400 text-xl">👤</span>
                </div>
                <p className="text-gray-700 dark:text-gray-200 font-medium leading-relaxed">{audience}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
        <AlertDescription className="text-gray-700 dark:text-gray-200 leading-relaxed">
          The percentages and metrics displayed are estimates based on our proprietary data analysis. Results may vary based on account activity and Instagram's policies.
        </AlertDescription>
      </Alert>
    </div>
  );
}