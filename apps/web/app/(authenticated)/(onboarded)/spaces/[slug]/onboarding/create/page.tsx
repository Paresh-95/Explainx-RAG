"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Switch } from "@repo/ui/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";
import { Progress } from "@repo/ui/components/ui/progress";
import {
  Plus,
  Trash2,
  FileText,
  Video,
  Mic,
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@repo/ui/hooks/use-toast";

// Types
type StepType = "TEXT" | "AUDIO" | "VIDEO" | "MIXED";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  stepType: StepType;
  textContent?: string;
  audioFile?: File;
  videoFile?: File;
  estimatedMinutes?: number;
  isRequired: boolean;
}

interface OnboardingFormData {
  title: string;
  description: string;
  isRequired: boolean;
  estimatedMinutes?: number;
  steps: OnboardingStep[];
}

type Params = {
  slug: string;
};

const CreateSpaceOnboarding = () => {
  const router = useRouter();
  const params: Params = useParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    title: "",
    description: "",
    isRequired: false,
    estimatedMinutes: undefined,
    steps: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add a new step
  const addStep = () => {
    const newStep: OnboardingStep = {
      id: `step-${Date.now()}`,
      title: "",
      description: "",
      stepType: "TEXT",
      textContent: "",
      estimatedMinutes: 5,
      isRequired: true,
    };

    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  // Remove a step
  const removeStep = (stepId: string) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== stepId),
    }));
  };

  // Update step data
  const updateStep = (stepId: string, updates: Partial<OnboardingStep>) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step,
      ),
    }));
  };

  // Handle file upload for steps
  const handleStepFileUpload = (
    stepId: string,
    file: File,
    type: "audio" | "video",
  ) => {
    updateStep(stepId, {
      [type === "audio" ? "audioFile" : "videoFile"]: file,
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.steps.length === 0) {
      newErrors.steps = "At least one step is required";
    }

    formData.steps.forEach((step, index) => {
      if (!step.title.trim()) {
        newErrors[`step-${step.id}-title`] =
          `Step ${index + 1} title is required`;
      }

      if (step.stepType === "TEXT" && !step.textContent?.trim()) {
        newErrors[`step-${step.id}-content`] =
          `Step ${index + 1} content is required`;
      }

      if (step.stepType === "AUDIO" && !step.audioFile) {
        newErrors[`step-${step.id}-audio`] =
          `Step ${index + 1} audio file is required`;
      }

      if (step.stepType === "VIDEO" && !step.videoFile) {
        newErrors[`step-${step.id}-video`] =
          `Step ${index + 1} video file is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file uploads
      const submitData = new FormData();

      console.log(params.slug);

      // Add basic onboarding data
      submitData.append("spaceId", params.slug);
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("isRequired", formData.isRequired.toString());
      if (formData.estimatedMinutes) {
        submitData.append(
          "estimatedMinutes",
          formData.estimatedMinutes.toString(),
        );
      }

      // Add steps data
      const stepsData = formData.steps.map((step, index) => ({
        stepNumber: index + 1,
        title: step.title,
        description: step.description,
        stepType: step.stepType,
        textContent: step.textContent || "",
        estimatedMinutes: step.estimatedMinutes || 5,
        isRequired: step.isRequired,
      }));

      submitData.append("steps", JSON.stringify(stepsData));

      // Add files
      formData.steps.forEach((step, index) => {
        if (step.audioFile) {
          submitData.append(`step-${index}-audio`, step.audioFile);
        }
        if (step.videoFile) {
          submitData.append(`step-${index}-video`, step.videoFile);
        }
      });

      const response = await fetch("/api/spaces/onboarding", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create onboarding");
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Onboarding flow created successfully!",
      });

      // Redirect back to space
      router.push(`/spaces/${params.slug}`);
    } catch (error) {
      console.error("Error creating onboarding:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (type: StepType) => {
    switch (type) {
      case "TEXT":
        return <FileText className="h-4 w-4" />;
      case "AUDIO":
        return <Mic className="h-4 w-4" />;
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "MIXED":
        return (
          <div className="h-4 w-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
        );
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const calculateTotalTime = () => {
    return formData.steps.reduce(
      (total, step) => total + (step.estimatedMinutes || 0),
      0,
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Onboarding Flow</h1>
          <p className="text-muted-foreground">
            Set up a guided introduction for new members joining this space
          </p>
        </div>
      </div>

      <div onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the general settings for your onboarding flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Onboarding Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Welcome to Our Space"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what new members will learn in this onboarding..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Required for all members</Label>
                <p className="text-sm text-muted-foreground">
                  Members must complete this onboarding to access the space
                </p>
              </div>
              <Switch
                checked={formData.isRequired}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isRequired: checked }))
                }
              />
            </div>

            <div>
              <Label htmlFor="estimatedMinutes">
                Estimated completion time (minutes)
              </Label>
              <Input
                id="estimatedMinutes"
                type="number"
                min="1"
                value={formData.estimatedMinutes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedMinutes: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="15"
              />
            </div>
          </CardContent>
        </Card>

        {/* Steps Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Onboarding Steps</CardTitle>
                <CardDescription>
                  Create a step-by-step guide for new members
                  {formData.steps.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {formData.steps.length} steps • ~{calculateTotalTime()}{" "}
                      min
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={addStep}
                disabled={loading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
            {errors.steps && (
              <Alert variant="destructive">
                <AlertDescription>{errors.steps}</AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No steps added yet. Click "Add Step" to get started.</p>
              </div>
            ) : (
              formData.steps.map((step, index) => (
                <Card key={step.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStepIcon(step.stepType)}
                          <Badge variant="outline">Step {index + 1}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {step.stepType}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(step.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Step Title *</Label>
                        <Input
                          value={step.title}
                          onChange={(e) =>
                            updateStep(step.id, { title: e.target.value })
                          }
                          placeholder="Step title..."
                          className={
                            errors[`step-${step.id}-title`]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors[`step-${step.id}-title`] && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors[`step-${step.id}-title`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>Step Type</Label>
                        <Select
                          value={step.stepType}
                          onValueChange={(value: StepType) =>
                            updateStep(step.id, { stepType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TEXT">Text Content</SelectItem>
                            <SelectItem value="AUDIO">
                              Audio Recording
                            </SelectItem>
                            <SelectItem value="VIDEO">Video Content</SelectItem>
                            <SelectItem value="MIXED">Mixed Content</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={step.description}
                        onChange={(e) =>
                          updateStep(step.id, { description: e.target.value })
                        }
                        placeholder="Describe what this step covers..."
                        rows={2}
                      />
                    </div>

                    {/* Content based on step type */}
                    {(step.stepType === "TEXT" ||
                      step.stepType === "MIXED") && (
                      <div>
                        <Label>Text Content *</Label>
                        <Textarea
                          value={step.textContent || ""}
                          onChange={(e) =>
                            updateStep(step.id, { textContent: e.target.value })
                          }
                          placeholder="Enter the text content for this step..."
                          rows={4}
                          className={
                            errors[`step-${step.id}-content`]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors[`step-${step.id}-content`] && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors[`step-${step.id}-content`]}
                          </p>
                        )}
                      </div>
                    )}

                    {(step.stepType === "AUDIO" ||
                      step.stepType === "MIXED") && (
                      <div>
                        <Label>Audio File</Label>
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file)
                              handleStepFileUpload(step.id, file, "audio");
                          }}
                          className={
                            errors[`step-${step.id}-audio`]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {step.audioFile && (
                          <p className="text-sm text-green-600 mt-1">
                            ✓ {step.audioFile.name}
                          </p>
                        )}
                        {errors[`step-${step.id}-audio`] && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors[`step-${step.id}-audio`]}
                          </p>
                        )}
                      </div>
                    )}

                    {(step.stepType === "VIDEO" ||
                      step.stepType === "MIXED") && (
                      <div>
                        <Label>Video File</Label>
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file)
                              handleStepFileUpload(step.id, file, "video");
                          }}
                          className={
                            errors[`step-${step.id}-video`]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {step.videoFile && (
                          <p className="text-sm text-green-600 mt-1">
                            ✓ {step.videoFile.name}
                          </p>
                        )}
                        {errors[`step-${step.id}-video`] && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors[`step-${step.id}-video`]}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Estimated time (minutes)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={step.estimatedMinutes || ""}
                          onChange={(e) =>
                            updateStep(step.id, {
                              estimatedMinutes: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            })
                          }
                          placeholder="5"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Required step</Label>
                        <Switch
                          checked={step.isRequired}
                          onCheckedChange={(checked) =>
                            updateStep(step.id, { isRequired: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading || formData.steps.length === 0}
            className="flex-1"
            onClick={handleSubmit}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Onboarding Flow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceOnboarding;
