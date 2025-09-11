"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Progress } from "@repo/ui/components/ui/progress";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function ProgressPage() {
  // This would typically come from your backend/database
  const topicPerformance = {
    "LLMs": { correct: 2, total: 3 },
    "NLP": { correct: 1, total: 2 },
    "ML": { correct: 3, total: 4 },
    "GenAI": { correct: 2, total: 4 }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-100">Exam Progress</h2>
          <p className="text-zinc-400">Track your learning journey</p>
        </div>
        
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-zinc-100">Topic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(topicPerformance).map(([topic, data]) => (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <span className="font-medium text-zinc-100">{topic}</span>
                      <span className="text-sm text-zinc-400 ml-2">
                        • Page {topic === 'LLMs' ? '61 - 64' : 
                              topic === 'NLP' ? '44 - 45' : 
                              topic === 'ML' ? '17 - 20' : '48 - 51'}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-300">
                      {data.correct}/{data.total}
                    </span>
                  </div>
                  <Progress 
                    value={data.total > 0 ? (data.correct / data.total) * 100 : 0} 
                    className="h-2" 
                  />
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="mt-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700">
                      Review <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 