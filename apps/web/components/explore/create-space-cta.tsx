'use client'
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { CreateSpaceDialog } from '../spaces/create-space-dialog';

export default function CreateSpaceCTA() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-16 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-12 shadow-sm">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Share Your Knowledge?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
            Create a public space and build a community around your expertise.
            Help others learn and grow.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Create New Space
            <ArrowRight className="h-5 w-5" />
          </button>
          <CreateSpaceDialog open={open} onOpenChange={setOpen} />
        </div>
      </div>
    </div>
  );
}

