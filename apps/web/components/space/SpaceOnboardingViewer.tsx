"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Progress } from "@repo/ui/components/ui/progress";
import { Badge } from "@repo/ui/components/ui/badge";
import { useToast } from "@repo/ui/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Play,
  Pause,
  FileText,
  Video,
  Mic,
  Clock,
  X,
  SkipForward,
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  stepNumber: number;
  stepType: "TEXT" | "AUDIO" | "VIDEO" | "MIXED";
  textContent?: string;
  audioUrl?: string;
  videoUrl?: string;
  estimatedMinutes?: number;
  isRequired: boolean;
}

interface OnboardingData {
  id: string;
  title: string;
  description: string;
  totalSteps: number;
  estimatedMinutes?: number;
  isRequired: boolean;
  steps: OnboardingStep[];
  userProgress?: {
    id: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    currentStepNumber: number;
    completedSteps: number;
  };
}

interface SpaceOnboardingViewerProps {
  spaceId: string;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const SpaceOnboardingViewer: React.FC<SpaceOnboardingViewerProps> = ({
  spaceId,
  open,
  onClose,
  onComplete,
}) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(
    null,
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCompleted, setStepCompleted] = useState<Record<number, boolean>>(
    {},
  );
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const { toast } = useToast();

  // Fetch onboarding data
  useEffect(() => {
    if (open && spaceId) {
      fetchOnboardingData();
    }
  }, [open, spaceId]);

  // Track time spent on current step
  useEffect(() => {
    const interval = setInterval(() => {
      if (open && onboardingData) {
        const currentTime = Date.now();
        const timeOnStep = Math.floor((currentTime - startTime) / 1000);
        setTimeSpent((prev) => ({
          ...prev,
          [currentStepIndex]: timeOnStep,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open, currentStepIndex, startTime, onboardingData]);

  const fetchOnboardingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/spaces/onboarding?spaceId=${spaceId}`);

      if (response.ok) {
        const data = await response.json();
        setOnboardingData(data.onboarding);

        // Set current step based on user progress
        if (data.onboarding.userProgress) {
          setCurrentStepIndex(
            Math.max(0, data.onboarding.userProgress.currentStepNumber - 1),
          );
        }
      } else {
        console.error("Failed to fetch onboarding data");
        onClose();
      }
    } catch (error) {
      console.error("Error fetching onboarding:", error);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const markStepComplete = async (
    stepIndex: number,
    canSkip: boolean = false,
  ) => {
    if (!onboardingData) return;

    const step = onboardingData.steps[stepIndex] as any;
    const isSkipping = canSkip && !stepCompleted[stepIndex];

    try {
      // Create or update progress
      const response = await fetch("/api/spaces/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboardingId: onboardingData.id,
          stepId: step.id,
          status: isSkipping ? "SKIPPED" : "COMPLETED",
          timeSpentSeconds: timeSpent[stepIndex] || 0,
          currentStepNumber: stepIndex + 1,
        }),
      });

      if (response.ok) {
        setStepCompleted((prev) => ({ ...prev, [stepIndex]: true }));

        toast({
          title: isSkipping ? "Step Skipped" : "Step Completed",
          description: `"${step.title}" has been ${isSkipping ? "skipped" : "completed"}.`,
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNext = async () => {
    if (!onboardingData) return;

    const currentStep = onboardingData.steps[currentStepIndex];

    // Mark current step as complete if not already
    if (!stepCompleted[currentStepIndex]) {
      await markStepComplete(currentStepIndex);
    }

    if (currentStepIndex < onboardingData.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setStartTime(Date.now());
    } else {
      // Onboarding complete
      await completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setStartTime(Date.now());
    }
  };

  const handleSkip = async () => {
    if (!onboardingData) return;

    const currentStep = onboardingData.steps[currentStepIndex] as any;
    if (!currentStep.isRequired) {
      await markStepComplete(currentStepIndex, true);
      handleNext();
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch("/api/spaces/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboardingId: onboardingData!.id,
        }),
      });

      if (response.ok) {
        toast({
          title: "Onboarding Complete!",
          description: "Welcome to the space! You can now access all features.",
        });
        onComplete();
        onClose();
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case "TEXT":
        return <FileText className="h-5 w-5" />;
      case "AUDIO":
        return <Mic className="h-5 w-5" />;
      case "VIDEO":
        return <Video className="h-5 w-5" />;
      case "MIXED":
        return (
          <div className="h-5 w-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
        );
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const calculateProgress = () => {
    if (!onboardingData) return 0;
    const completed = Object.values(stepCompleted).filter(Boolean).length;
    return (completed / onboardingData.steps.length) * 100;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!onboardingData) {
    return null;
  }

  const currentStep = onboardingData.steps[currentStepIndex] as any;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === onboardingData.steps.length - 1;
  const canSkip = !currentStep?.isRequired;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">
                  {onboardingData.title}
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  {onboardingData.description}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Progress:{" "}
                  {Object.values(stepCompleted).filter(Boolean).length} of{" "}
                  {onboardingData.steps.length} steps
                </span>
                <span>{Math.round(calculateProgress())}% complete</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStepIcon(currentStep.stepType)}
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Step {currentStep.stepNumber}: {currentStep.title}
                        {stepCompleted[currentStepIndex] && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentStep.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{currentStep.stepType}</Badge>
                    {currentStep.estimatedMinutes && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {currentStep.estimatedMinutes} min
                      </Badge>
                    )}
                    {!currentStep.isRequired && (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Text Content */}
                {(currentStep.stepType === "TEXT" ||
                  currentStep.stepType === "MIXED") &&
                  currentStep.textContent && (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {currentStep.textContent}
                      </div>
                    </div>
                  )}

                {/* Audio Content */}
                {(currentStep.stepType === "AUDIO" ||
                  currentStep.stepType === "MIXED") &&
                  currentStep.audioUrl && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Mic className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Audio Content</span>
                      </div>
                      <audio
                        controls
                        className="w-full"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      >
                        <source src={currentStep.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                {/* Video Content */}
                {(currentStep.stepType === "VIDEO" ||
                  currentStep.stepType === "MIXED") &&
                  currentStep.videoUrl && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Video className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Video Content</span>
                      </div>
                      <video
                        controls
                        className="w-full rounded"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      >
                        <source src={currentStep.videoUrl} type="video/mp4" />
                        Your browser does not support the video element.
                      </video>
                    </div>
                  )}

                {/* Time tracking display */}
                <div className="text-sm text-muted-foreground">
                  Time on this step:{" "}
                  {Math.floor((timeSpent[currentStepIndex] || 0) / 60)}m{" "}
                  {(timeSpent[currentStepIndex] || 0) % 60}s
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Navigation */}
          <div className="border-t p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {canSkip && !stepCompleted[currentStepIndex] && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="flex items-center gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                  disabled={
                    currentStep.isRequired && !stepCompleted[currentStepIndex]
                  }
                >
                  {isLastStep ? "Complete" : "Next"}
                  {!isLastStep && <ArrowRight className="h-4 w-4" />}
                  {isLastStep && <CheckCircle className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpaceOnboardingViewer;
