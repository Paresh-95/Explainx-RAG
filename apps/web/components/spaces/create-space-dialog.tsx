"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSpaces } from "../../contexts/space-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Switch } from "@repo/ui/components/ui/switch";

const createSpaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
});

type CreateSpaceFormData = z.infer<typeof createSpaceSchema>;

interface CreateSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSpaceDialog({
  open,
  onOpenChange,
}: CreateSpaceDialogProps) {
  const { addSpace } = useSpaces();
  const [isCreating, setIsCreating] = useState(false);
  const [createOnboarding, setCreateOnboarding] = useState(false);
  const router = useRouter();

  const form = useForm<CreateSpaceFormData>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const handleCreateSpace = async (data: CreateSpaceFormData) => {
    try {
      setIsCreating(true);
      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          isPublic: false,
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        addSpace(responseData.space);
        onOpenChange(false);
        form.reset();
        setCreateOnboarding(false); // Reset onboarding toggle

        // Check if user wants to create onboarding
        if (createOnboarding) {
          router.push(`/spaces/${responseData.space.id}/onboarding/create`);
        } else {
          router.push(`/spaces/${responseData.space.slug}`);
        }
      } else {
        console.error("Failed to create space:", responseData.error);
        if (responseData.code === "SLUG_EXISTS") {
          form.setError("slug", {
            type: "manual",
            message:
              "This URL is already taken. Please choose a different one.",
          });
        }
      }
    } catch (error) {
      console.error("Error creating space:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("name", value);
    const slug = value.toLowerCase().replace(/[^a-z0-9]/g, "-");
    form.setValue("slug", slug);
  };

  const resetDialog = () => {
    form.reset();
    setCreateOnboarding(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetDialog();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Space</DialogTitle>
          <DialogDescription>
            Create a new space to organize your learning materials.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateSpace)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Space Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={handleNameChange}
                      placeholder="My Learning Space"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Space URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground px-3 py-2 bg-muted border rounded-l-md">
                        learn.explainx.ai/spaces/
                      </span>
                      <Input
                        {...field}
                        placeholder="my-space"
                        className="rounded-l-none"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    This will be your unique URL for the space.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="What's this space about?" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ADD ONBOARDING TOGGLE */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <FormLabel htmlFor="onboarding">
                  Create Onboarding Flow
                </FormLabel>
                <FormDescription>
                  Set up a guided introduction for new space members
                </FormDescription>
              </div>
              <Switch
                id="onboarding"
                checked={createOnboarding}
                onCheckedChange={setCreateOnboarding}
                disabled={isCreating}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Space"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
