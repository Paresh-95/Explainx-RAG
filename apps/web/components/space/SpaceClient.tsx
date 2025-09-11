"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  BookCheck,
  Link2,
  MessagesSquare,
  Mic,
  Upload,
  Users,
  Globe,
  Lock,
  Settings,
  Video,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { StudyMaterialCard } from "../study-material-card";
import CreateStudyMaterial from "../dashboard/CreateStudyMaterial";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@repo/ui/lib/utils";
import SpaceChat from "./SpaceChat";
import SpaceMembersModal from "./SpaceMembersModal";
import SpaceVisibilityModal from "./SpaceVisibilityModal";
import SpaceExamModal from "./SpaceExamModal";
import SpaceOnboardingViewer from "./SpaceOnboardingViewer";
import { useExamSettings } from "../../contexts/examSettingsContext";
import { useRouter } from "next/navigation";
import { Space } from "../../types";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";

interface SpaceClientProps {
  space: Space & {
    studyMaterials: any[];
    owner: {
      username: string | null;
      name: string | null;
      id: string;
    };
    // New membership-related properties
    userRole?: string;
    userMembership?: any;
    permissions?: {
      canEdit: boolean;
      canDelete: boolean;
      canManageMembers: boolean;
      canUpload: boolean;
      canView: boolean;
      canJoin: boolean;
      canLeave: boolean;
    };
    memberCount?: number;
    materialCount?: number;
  };
  session?: any;
}

export default function SpacePublicClient({
  space,
  session,
}: SpaceClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<
    "upload" | "paste" | "record" | null
  >(null);
  const [showChat, setShowChat] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [currentSpace, setCurrentSpace] = useState(space);
  const [refreshMeetings, setRefreshMeetings] = useState(0);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { setExamSettings } = useExamSettings();
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingRequirement = async () => {
      // Only check for members and viewers, not owners or admins
      if (
        !session?.user?.id ||
        !currentSpace.userRole ||
        currentSpace.userRole === "OWNER" ||
        currentSpace.userRole === "ADMIN"
      ) {
        return;
      }

      try {
        const response = await fetch(
          `/api/spaces/onboarding?spaceId=${currentSpace.id}`,
        );

        if (response.ok) {
          const data = await response.json();
          const onboarding = data.onboarding;
          console.log(onboarding);

          // Check if onboarding exists and is required
          if (onboarding) {
            setOnboardingData(onboarding);

            // Check if user has completed onboarding
            const userProgress = onboarding.userProgress;
            const isCompleted = userProgress?.status === "COMPLETED";

            setHasCompletedOnboarding(isCompleted);

            // Show onboarding modal if not completed
            if (!isCompleted) {
              setShowOnboarding(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking onboarding requirement:", error);
      }
    };

    checkOnboardingRequirement();
  }, [currentSpace.id, currentSpace.userRole, session?.user?.id]);

  // Handler for onboarding completion
  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };
  const handleOnboardingClose = () => {
    if (onboardingData?.isRequired && !hasCompletedOnboarding) {
      // Show warning or prevent closing for required onboarding
      const shouldClose = confirm(
        "This onboarding is required to access the space. Are you sure you want to close it?",
      );

      if (shouldClose) {
        setShowOnboarding(false);
        // Optionally redirect away from the space
        router.push("/spaces");
      }
    } else {
      setShowOnboarding(false);
    }
  };

  const handleMeetingCreated = () => {
    setRefreshMeetings((prev) => prev + 1);
  };

  const handleCardClick = (method: "upload" | "paste" | "record") => {
    setSelectedMethod(method);
    setModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) setSelectedMethod(null);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const handleVisibilityUpdate = (updatedSpace: any) => {
    setCurrentSpace({ ...currentSpace, ...updatedSpace });
  };

  // Check if user can upload content
  const canUpload = currentSpace.permissions?.canUpload ?? true;

  // Check if user can manage space settings (owner or admin)
  const canManageSpace =
    currentSpace.userRole === "OWNER" || currentSpace.userRole === "ADMIN";

  // Handler for starting the exam (now calls API)
  const handleStartExam = async (settings: any) => {
    setExamSettings({
      questionType: settings.questionType,
      examLength: settings.examLength,
      count: settings.numQuestions,
    });
    router.push(`/exam/${currentSpace.slug}`);
  };

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-transparent">
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={showChat ? 50 : 100} minSize={30}>
          <div className="h-full flex flex-col overflow-hidden">
            {/* Fixed top section */}
            <div className="flex-none p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-transparent pb-6">
              {/* Learn anything input and cards - Only show if user can upload */}
              {canUpload && (
                <div className="w-full max-w-6xl mx-auto">
                  <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                    What do you want to learn?
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Upload Card */}
                    <div
                      className="bg-gray-100 dark:bg-zinc-900 rounded-xl p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-zinc-800 transition-colors border border-gray-200 dark:border-zinc-800"
                      onClick={() => handleCardClick("upload")}
                    >
                      <div className="flex flex-col items-start">
                        <Upload className="h-6 w-6 mb-2 text-purple-600" />
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          Upload
                        </div>
                        <div className="text-sm text-gray-500 dark:text-zinc-400">
                          File, audio, video
                        </div>
                      </div>
                    </div>
                    {/* Paste Card */}
                    <div
                      className="bg-gray-100 dark:bg-zinc-900 rounded-xl p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-zinc-800 transition-colors border border-gray-200 dark:border-zinc-800"
                      onClick={() => handleCardClick("paste")}
                    >
                      <div className="flex flex-col items-start">
                        <Link2 className="h-6 w-6 mb-2 text-purple-600" />
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          Paste
                        </div>
                        <div className="text-sm text-gray-500 dark:text-zinc-400">
                          YouTube, website, text
                        </div>
                      </div>
                    </div>
                    {/* Record Card */}
                    <div
                      className="bg-gray-100 dark:bg-zinc-900 rounded-xl p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-zinc-800 transition-colors border border-gray-200 dark:border-zinc-800"
                      onClick={() => handleCardClick("record")}
                    >
                      <div className="flex flex-col items-start">
                        <Mic className="h-6 w-6 mb-2 text-purple-600" />
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          Record
                        </div>
                        <div className="text-sm text-gray-500 dark:text-zinc-400">
                          Record class, video call
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Learn anything input */}
                  <div className="w-full">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Learn anything"
                        className="w-full py-3 px-4 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-white focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setModalOpen(true);
                          }
                        }}
                      />
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-colors shadow"
                        onClick={() => setModalOpen(true)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show message for viewers who can't upload */}
              {!canUpload && (
                <div className="w-full max-w-6xl mx-auto text-center py-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-300 mb-2">
                    You're viewing this space
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    You can view and chat about the study materials below.
                  </p>
                </div>
              )}
            </div>

            {/* Scrollable content section */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-transparent pt-6">
              <div className="p-4">
                {/* Header Row with Membership Info */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-6xl mx-auto mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {currentSpace.name || "Untitled Space"}
                      </h1>

                      {/* Space Visibility Badge */}
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                          currentSpace.isPublic
                            ? "bg-green-100 text-green-800 dark:bg-green-100 dark:text-green-800"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-100 dark:text-gray-800",
                        )}
                      >
                        {currentSpace.isPublic ? (
                          <>
                            <Globe className="h-3 w-3" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            Private
                          </>
                        )}
                      </span>

                      {/* User Role Badge */}
                      {currentSpace.userRole && (
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            currentSpace.userRole === "OWNER" &&
                              "bg-purple-100 text-purple-800 dark:bg-purple-100 dark:text-purple-800",
                            currentSpace.userRole === "ADMIN" &&
                              "bg-blue-100 text-blue-800 dark:bg-blue-100 dark:text-blue-800",
                            currentSpace.userRole === "MEMBER" &&
                              "bg-gray-100 text-gray-800 dark:bg-gray-100 dark:text-gray-800",
                            currentSpace.userRole === "VIEWER" &&
                              "bg-yellow-100 text-yellow-800 dark:bg-yellow-100 dark:text-yellow-800",
                          )}
                        >
                          {currentSpace.userRole}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-lg mb-3">
                      {currentSpace.description || "No description"}
                    </p>

                    {/* Space Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => setShowMembersModal(true)}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        <Users className="h-4 w-4" />
                        <span>{currentSpace.memberCount || 1} members</span>
                      </button>
                      <span className="flex items-center gap-1">
                        <BookCheck className="h-4 w-4" />
                        <span>
                          {currentSpace.materialCount ||
                            currentSpace.studyMaterials.length}{" "}
                          materials
                        </span>
                      </span>
                      <span className="text-gray-500">
                        by{" "}
                        {currentSpace.owner.name || currentSpace.owner.username}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                    {/* Space Settings Button (for owners/admins) */}

                    <button
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-2xl text-white border border-zinc-700 transition",
                        showChat
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800",
                      )}
                      onClick={toggleChat}
                    >
                      <MessagesSquare className="h-4 w-4" />
                      Space Chat
                    </button>

                    <button
                      className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-purple-600 text-white font-semibold border border-purple-700 hover:bg-purple-700 transition"
                      onClick={() => setShowExamModal(true)}
                    >
                      <BookCheck className="h-4 w-4" />
                      Create Exam
                    </button>

                    {canManageSpace && (
                      <button
                        onClick={() => setShowVisibilityModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl text-gray-900 border  hover:bg-zinc-100  dark:hover:bg-zinc-800 dark:text-white  transition"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full max-w-6xl mx-auto border-b border-gray-200 dark:border-zinc-800 mb-6" />

                {/* Study Materials Section */}
                <div className="w-full max-w-6xl mx-auto mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Study Materials
                  </h2>
                  {currentSpace.studyMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentSpace.studyMaterials.map((material) => (
                        <StudyMaterialCard
                          key={material.id}
                          item={{
                            id: material.id,
                            title: material.title,
                            type: material.type,
                            youtubeUrl: material.youtubeUrl || undefined,
                            fileUrl: material.fileUrl || undefined,
                            fileName: material.fileName || undefined,
                            mimeType: material.mimeType || undefined,
                            createdAt: material.createdAt,
                            slug: material.slug,
                            docid: material.docid,
                            isPublic: material.isPublic,
                            uploadedById: material.uploadedById,
                            space: {
                              slug: currentSpace.slug,
                            },
                          }}
                          canEdit={material.uploadedById === session?.user?.id}
                          onVisibilityUpdate={(updatedMaterial) => {
                            // Update the material in the current space state
                            setCurrentSpace((prev) => ({
                              ...prev,
                              studyMaterials: prev.studyMaterials.map((m) =>
                                m.id === updatedMaterial.id
                                  ? { ...m, ...updatedMaterial }
                                  : m,
                              ),
                            }));
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookCheck className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-300 mb-2">
                        No study materials yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {canUpload
                          ? "Start by uploading your first material above."
                          : "The space owner will add study materials soon."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Meetings Section */}
                <div className="w-full max-w-6xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Meetings
                    </h2>
                  </div>

                  {/* New UI for directing users to create meetings */}
                  {canManageSpace && (
                    <Card className="mb-6 border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="flex justify-center mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                              <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Host Events & Create Meetings
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
                            Go to your personal space to create meetings, host
                            events, and manage your schedule.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                              onClick={() =>
                                router.push(
                                  `/${currentSpace.owner.username || "user"}/${currentSpace.slug}`,
                                )
                              }
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Go to My Space
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                            {/* <Button
                              variant="outline"
                              onClick={() => router.push(`/${currentSpace.owner.username || 'user'}`)}
                              className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/20"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              View Profile
                            </Button> */}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {showChat && (
          <>
            <PanelResizeHandle
              className={cn(
                "w-px bg-gray-200 dark:bg-gray-700 cursor-col-resize mx-2",
              )}
            />
            <Panel defaultSize={50} minSize={20}>
              <div className="h-full bg-white dark:bg-[#18181b]">
                <SpaceChat
                  spaceId={currentSpace.id}
                  studyMaterials={currentSpace.studyMaterials}
                  session={session}
                  onExpand={() => setShowChat(false)}
                />
              </div>
            </Panel>
          </>
        )}

        {/* Modal for upload/paste/record - Only render if user can upload */}
        {canUpload && (
          <CreateStudyMaterial
            open={modalOpen}
            onOpenChange={handleModalClose}
            initialMethod={selectedMethod}
            fixedSpaceId={currentSpace.id}
          />
        )}

        {/* Members Modal */}
        {currentSpace.permissions && (
          <SpaceMembersModal
            spaceSlug={currentSpace.slug}
            isOpen={showMembersModal}
            onClose={() => setShowMembersModal(false)}
            canManageMembers={currentSpace.permissions.canManageMembers}
            currentUserId={session?.user?.id}
          />
        )}

        {/* Space Visibility Modal */}
        {canManageSpace && (
          <SpaceVisibilityModal
            spaceId={currentSpace.id}
            spaceName={currentSpace.name}
            isOpen={showVisibilityModal}
            onClose={() => setShowVisibilityModal(false)}
            onVisibilityUpdate={handleVisibilityUpdate}
          />
        )}

        {/* Space Exam Modal */}
        <SpaceExamModal
          isOpen={showExamModal}
          onClose={() => setShowExamModal(false)}
          spaceName={currentSpace.name}
          studyMaterials={currentSpace.studyMaterials}
          onStartExam={handleStartExam}
        />
      </PanelGroup>
      {onboardingData && (
        <SpaceOnboardingViewer
          spaceId={currentSpace.id}
          open={showOnboarding}
          onClose={handleOnboardingClose}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}
