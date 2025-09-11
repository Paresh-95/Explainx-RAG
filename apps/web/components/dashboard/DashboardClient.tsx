"use client";

import { useState, useEffect } from "react";
import { Link2, Mic, Upload, ArrowUp, Loader2 } from "lucide-react";
import CreateStudyMaterial from "./CreateStudyMaterial"; // Adjust path as needed
import SpacesList from "./SpaceList";
import RecentsList from "./RecentsList";
import ExploreList from "./ExploreList";
import { useStudyMaterial } from "../../hooks/useStudyMaterial";
import { useFirstMessage } from "../../contexts/first-message-provider";
import SharedSpacesList from "./SharedSpacesList";
import { TourProvider, useTour, TourStep, TourAlertDialog } from "@repo/ui/components/ui/tour";

export type CreateMethod = "upload" | "paste" | "record";

export const TOUR_STEP_IDS = {
  SPACE_ADD :"tour-add-space",
  UPLOAD_CARD: "upload-card",
  CREATE_MODAL: "create-modal",
  YOUTUBE_CARD:"youtube-card",
  RECORD_CARD:"record-card",
  LEARN :"learn-anything",
  SPACE:"space",
  SHARED:"shared",
  RECENT:"recent",

  // Add more as needed
};



function DashboardClientInner() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<CreateMethod | null>(
    null
  );
  const [learnInput, setLearnInput] = useState("");

  const { setFirstMessage } = useFirstMessage();
  const { setSteps, startTour, isTourCompleted } = useTour();
  const [showTourDialog, setShowTourDialog] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('demo_tour') !== 'true') {
      setShowTourDialog(true);
    }
  }, []);

  const DASHBOARD_TOUR_STEPS: TourStep[] = [
    {
      selectorId: TOUR_STEP_IDS.SPACE_ADD,
      content: (
        <>
          <h3 className="font-semibold text-lg mb-2">You can create your space</h3>
          <p className="text-sm text-muted-foreground">
            Enter space name, enter unique url, description and create space.
          </p>
        </>
      ),
      position: "left",
   
    },
    {
      selectorId: TOUR_STEP_IDS.UPLOAD_CARD,
      content: (
        <>
          <h3 className="font-semibold text-lg mb-2">Upload Your First Material</h3>
          <p className="text-sm text-muted-foreground">
            Click the <b>Upload</b> card to add your study material. You can upload PDFs, Word docs, and more!
          </p>
        </>
      ),
      position: "bottom",
      onNext: async () => {
        setSelectedMethod("upload");
        setModalOpen(true);
        await new Promise(resolve => setTimeout(resolve, 300));
      },
    },
    {
      selectorId: TOUR_STEP_IDS.CREATE_MODAL,
      content: (
        <>
          <h3 className="font-semibold text-lg mb-2">Welcome to Your Study Space</h3>
          <p className="text-sm text-muted-foreground">
            A <b>Space</b> is where all your uploaded or linked materials are stored. Give it a name, upload your file, and start learning!
          </p>
        </>
      ),
      position: "right",
    },
   
  ];
  

  useEffect(() => {
    setSteps(DASHBOARD_TOUR_STEPS);
  }, [setSteps]);

  // Use the custom hook for creating study materials
  const { createStudyMaterial, isCreating, error, clearError } = useStudyMaterial({
    message: false, // Don't send first message automatically
    firstMessage: learnInput, // Use the input as first message
  });

  const handleCardClick = (method: CreateMethod) => {
    setSelectedMethod(method);
    setModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      // Reset selected method when modal closes
      setSelectedMethod(null);
    }
  };

  const handleLearnAnything = async () => {
    if (!learnInput.trim() || isCreating) return;

    const query = learnInput.trim();
    
    // Set the first message in context before creating study material
    setFirstMessage(query);
    
    // Create a study material with the query as title and content
    await createStudyMaterial({
      title: query,
      description: `Learning session: ${query}`,
      content: query,
      type: 'TEXT_NOTES',
    });

    // Clear the input after creation
    setLearnInput("");
  };

  const handleLearnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLearnAnything();
    }
  };

  const handleTourComplete = () => {
    localStorage.setItem('demo_tour', 'true');
    setShowTourDialog(false);
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen mt-20 bg-white dark:bg-transparent">
      <TourAlertDialog isOpen={showTourDialog} setIsOpen={handleTourComplete} />
    
      <div id="tour-container" className="w-full max-w-2xl mt-8 mb-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-center text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          What do you want to learn?
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Upload Card */}
          <div
            id={TOUR_STEP_IDS.UPLOAD_CARD}
            className="bg-gray-100 dark:bg-zinc-900 rounded-xl p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-zinc-800 transition-colors border border-gray-200 dark:border-zinc-800"
            onClick={() => {
              setSelectedMethod("upload");
              setModalOpen(true);
            }}
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
           id={TOUR_STEP_IDS.YOUTUBE_CARD}
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
           id={TOUR_STEP_IDS.RECORD_CARD}
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
        <div 
         id={TOUR_STEP_IDS.LEARN}
        className="w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="Learn anything"
              value={learnInput}
              onChange={(e) => setLearnInput(e.target.value)}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyDown={handleLearnKeyDown}
              disabled={isCreating}
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleLearnAnything}
              disabled={!learnInput.trim() || isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Error display */}
          {error && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
              <button 
                onClick={clearError}
                className="ml-2 underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Spaces List Component */}

      </div>
      <div   id={TOUR_STEP_IDS.SPACE} className="mt-10 w-full max-w-4xl">
        <SpacesList />
      </div>

      <div   id={TOUR_STEP_IDS.SHARED} className="mt-10 w-full max-w-4xl">
        <SharedSpacesList />
      </div>

      <div   id={TOUR_STEP_IDS.RECENT} className="mt-10 w-full max-w-4xl">
        <RecentsList />
      </div>


      {/* Modal Integration */}
      <CreateStudyMaterial
        open={modalOpen}
        onOpenChange={handleModalClose}
        initialMethod={selectedMethod}
        tourModalId={TOUR_STEP_IDS.CREATE_MODAL}
      />
    </div>
  );
}

export default function DashboardClient() {
  return (
    <TourProvider>
      <DashboardClientInner />
    </TourProvider>
  );
}
