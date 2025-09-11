"use client";

import { useState } from "react";
import { X, BookCheck, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/components/ui/dialog";

import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";

interface StudyMaterial {
  id: string;
  title: string;
  type: string;
}

interface SpaceExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceName: string;
  studyMaterials: StudyMaterial[];
  onStartExam: (settings: {
    selectedMaterialIds: string[];
    numQuestions: number;
    questionType: string;
    examLength: number;
  }) => void;
}

export default function SpaceExamModal({
  isOpen,
  onClose,
  spaceName,
  studyMaterials,
  onStartExam,
}: SpaceExamModalProps) {
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>(
    studyMaterials.map((m) => m.id),
  );
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionType, setQuestionType] = useState("mixed");
  const [examLength, setExamLength] = useState(45); // in minutes
  const [loading, setLoading] = useState(false);

  const handleMaterialToggle = (id: string) => {
    setSelectedMaterialIds((prev) =>
      prev.includes(id)
        ? prev.filter((mid) => mid !== id)
        : [...prev, id],
    );
  };

  const handleStart = async () => {
    setLoading(true);
    await onStartExam({
      selectedMaterialIds,
      numQuestions,
      questionType,
      examLength,
    });
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-zinc-900 border border-zinc-700">
        <DialogHeader>
          <DialogTitle>Exam Settings</DialogTitle>
          <DialogDescription>
            Choose contents to have for your exam below. An exam will be generated based on these contents.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-white mb-2">"{spaceName}"</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="numQuestions" className="text-zinc-300">Number of Questions</Label>
              <Input
                id="numQuestions"
                type="number"
                min={1}
                max={100}
                value={numQuestions}
                onChange={e => setNumQuestions(Number(e.target.value))}
                className="mt-1 bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="questionType" className="text-zinc-300">Question Type</Label>
              <select
                id="questionType"
                value={questionType}
                onChange={e => setQuestionType(e.target.value)}
                className="mt-1 w-full bg-zinc-800 border-zinc-700 text-white rounded-md px-3 py-2"
              >
                <option value="mixed">Mixed</option>
                <option value="mcq">Multiple Choice</option>
                <option value="text">Short Answer</option>
              </select>
            </div>
            <div>
              <Label htmlFor="examLength" className="text-zinc-300">Exam Length (minutes)</Label>
              <Input
                id="examLength"
                type="number"
                min={5}
                max={180}
                value={examLength}
                onChange={e => setExamLength(Number(e.target.value))}
                className="mt-1 bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleStart}
            disabled={loading || selectedMaterialIds.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Start Exam"}
          </Button>
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 