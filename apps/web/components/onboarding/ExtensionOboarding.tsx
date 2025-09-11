"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"
export default function ExtensionOboarding({ alreadyOnboarded = false }: { alreadyOnboarded?: boolean }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState('learner');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    organizationSlug: '',
  });
  const [spaceData, setSpaceData] = useState({
    spaceName: '',
    spaceUrl: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (alreadyOnboarded) {
      setCurrentStep(4);
    }
  }, [alreadyOnboarded]);

  // Auto-generate organization slug from name
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      let updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.organizationSlug = value.toLowerCase().replace(/[^a-z0-9]/g, '-');
      }
      return updated;
    });
  };

  // Auto-generate space slug from name
  const handleSpaceInputChange = (field: string, value: string) => {
    setSpaceData(prev => {
      let updated = { ...prev, [field]: value };
      if (field === 'spaceName') {
        updated.spaceUrl = value.toLowerCase().replace(/[^a-z0-9]/g, '-');
      }
      return updated;
    });
  };

  const handleNext = async () => {
    setError(null);
    if (currentStep === 2) {
      // Call onboarding API
      setLoading(true);
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationName: formData.name,
            organizationSlug: formData.organizationSlug,
            username: formData.username,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Something went wrong');
        }
        const result = await res.json();
        setOrganizationId(result.organization.id);
        setCurrentStep(currentStep + 1);
      } catch (err: any) {
        setError(err.message || 'Failed to complete onboarding');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (currentStep === 3) {
      // Call create space API
      setLoading(true);
      try {
        const res = await fetch('/api/spaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: spaceData.spaceName,
            slug: spaceData.spaceUrl,
            description: spaceData.description,
            isPublic: false,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          if (errorData.code === 'SLUG_EXISTS') {
            setError('This space URL is already taken. Please choose a different one.');
            return;
          }
          throw new Error(errorData.error || 'Failed to create space');
        }
        setCurrentStep(currentStep + 1);
      } catch (err: any) {
        setError(err.message || 'Failed to create space');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);

      // Show toast
      toast("Woohoo! Your profile is all set 🎉", {
        description: "Buckle up... we're launching you to your dashboard!",
        action: {
          label: "Take me now",
          onClick: () => {
            router.push('/dashboard');
          },
        },
      });

    }

  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-12 h-full min-h-screen">
        {/* Left Section */}
        <div className="md:col-span-7 col-span-1 h-full w-full p-4 md:p-8 flex flex-col">
          {/* Logo */}
          <div className="w-full flex justify-center md:justify-start mb-6">
            ExplainX
          </div>

          {/* Modern Progress Bar */}
          <div className="w-full max-w-lg mx-auto mb-8">
            <div className="relative">
              {/* Background line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 rounded-full"></div>
              {/* Active progress line */}
              <div className="absolute top-4 left-4 h-0.5 bg-purple-600 rounded-full transition-all duration-500 ease-out" style={{ width: `calc(${((currentStep - 1) / 3) * 100}% + 2rem)` }}></div>

              {/* Step indicators */}
              <div className="relative flex justify-between">
                {[
                  { step: 1, label: 'Role', active: currentStep >= 1 },
                  { step: 2, label: 'Profile', active: currentStep >= 2 },
                  { step: 3, label: 'Space', active: currentStep >= 3 },
                  { step: 4, label: 'Finish', active: currentStep >= 4 }
                ].map((item, idx) => (
                  <div key={item.step} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${item.active
                      ? currentStep === item.step
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                        : 'bg-purple-600 text-white'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}>
                      {currentStep > item.step ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        item.step
                      )}
                    </div>
                    <span className={`text-xs mt-3 font-medium transition-colors duration-300 ${currentStep === item.step ? 'text-purple-600' : item.active ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full flex flex-col h-full max-w-lg mx-auto ">
            {error && (
              <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300 text-sm">{error}</div>
            )}
            {currentStep === 1 && (
              <>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">Tell us more about your work</h1>
                <p className="text-muted-foreground mb-8 md:mb-10">Let's tailor the system to your needs.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedOption('learner')}
                    className={`w-full px-5 py-4 rounded-xl border transition-all duration-300 flex items-center gap-2 ${selectedOption === 'learner'
                      ? 'border-purple-500 bg-primary/5'
                      : 'border-border hover:border-muted'
                      }`}
                  >
                    <div className="text-left">
                      <h3 className="font-medium text-lg">I'm a Learner</h3>
                      <span className="text-sm font-semibold text-muted-foreground">Access personalized courses, quizzes, and track your progress.</span>
                    </div>
                    <div className="ml-auto flex -space-x-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-red-500">
                        <img src="https://i.pravatar.cc/100?img=4" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-green-500">
                        <img src="https://i.pravatar.cc/100?img=5" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-blue-500">
                        <img src="https://i.pravatar.cc/100?img=6" alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedOption('creator')}
                    className={`w-full px-5 py-4 rounded-xl border transition-all duration-300 flex items-center gap-2 ${selectedOption === 'creator'
                      ? 'border-purple-500 bg-primary/5'
                      : 'border-border hover:border-muted'
                      }`}
                  >
                    <div className="text-left">
                      <h3 className="font-medium text-lg">I'm a Creator</h3>
                      <span className="text-sm font-semibold text-muted-foreground">Build and share your own learning content with the community.</span>
                    </div>
                    <div className="ml-auto flex -space-x-3">
                      <div className="w-9 h-9 rounded-full border-2 border-background overflow-hidden">
                        <img src="https://i.pravatar.cc/100?img=1" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-9 h-9 rounded-full border-2 border-background overflow-hidden">
                        <img src="https://i.pravatar.cc/100?img=2" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-9 h-9 rounded-full border-2 border-background overflow-hidden">
                        <img src="https://i.pravatar.cc/100?img=3" alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">Set up your profile</h1>
                <p className="text-muted-foreground mb-8 md:mb-10">Create your personalized learning profile.</p>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                    <span className="text-sm font-semibold text-muted-foreground mt-2 block">This will be displayed on your learning profile and certificates.</span>
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Choose a unique username"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                    <span className="text-sm font-semibold text-muted-foreground mt-2 block">
                      Your profile will be available at: learn.explainx.ai/{formData.username || 'username'}
                    </span>
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">Create Your First Space</h1>
                <p className="text-muted-foreground mb-8 md:mb-10">Create a space to start organizing your learning materials.</p>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="spaceName" className="block text-sm font-medium text-foreground mb-2">
                      Space Name
                    </label>
                    <input
                      type="text"
                      id="spaceName"
                      value={spaceData.spaceName}
                      onChange={(e) => handleSpaceInputChange('spaceName', e.target.value)}
                      placeholder="e.g., JavaScript Fundamentals, Data Science Journey"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                    <span className="text-sm font-semibold text-muted-foreground mt-2 block">Choose a descriptive name for your learning space.</span>
                  </div>

                  <div>
                    <label htmlFor="spaceUrl" className="block text-sm font-medium text-foreground mb-2">
                      Space URL
                    </label>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground bg-gray-50 border border-r-0 border-border rounded-l-xl px-3 py-3">
                        learn.explainx.ai/spaces/
                      </span>
                      <input
                        type="text"
                        id="spaceUrl"
                        value={spaceData.spaceUrl}
                        onChange={(e) => handleSpaceInputChange('spaceUrl', e.target.value)}
                        placeholder="javascript-fundamentals"
                        className="flex-1 px-4 py-3 rounded-r-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground mt-2 block">This will be your unique URL for the space.</span>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                      Description <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <textarea
                      id="description"
                      value={spaceData.description}
                      onChange={(e) => handleSpaceInputChange('description', e.target.value)}
                      placeholder="Describe what you'll be learning in this space..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                    <span className="text-sm font-semibold text-muted-foreground mt-2 block">Help others understand what this space is about.</span>
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">You're all set!</h1>
                <p className="text-muted-foreground mb-8 md:mb-10">Welcome to your personalized learning journey.</p>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Setup Complete</h3>
                </div>
                {/* Chrome Extension Overview */}
                <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-xl text-left">
                  <h2 className="text-xl font-bold mb-2 text-purple-700">🚀 Get Started with the ExplainX Chrome Extension!</h2>
                  <p className="mb-2 text-purple-900">With our Chrome extension, you can:</p>
                  <ul className="list-disc pl-6 mb-2 text-purple-900">
                    <li>Highlight and save content from any website directly to your learning spaces</li>
                    <li>Access your flashcards and quizzes on the go</li>
                    <li>Sync your progress seamlessly between web and extension</li>
                  </ul>
                  <a href="https://chrome.google.com/webstore/detail/explainx-extension/" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">Install Chrome Extension</a>
                </div>
              </>
            )}
          </div>
          <div className="mt-auto pt-8 flex flex-col md:flex-row justify-between gap-4 md:gap-0">
            <button
              onClick={handleBack}
              className={`px-5 py-2 transition-colors ${currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-muted-foreground hover:text-foreground'
                }`}
              disabled={currentStep === 1 || loading}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (currentStep === 4) {
                  router.push('/dashboard');
                } else {
                  handleNext();
                }
              }}
              className={`px-6 py-2 rounded-md bg-purple-600 text-white font-medium transition-all ${
                (currentStep === 1 && !selectedOption) ||
                (currentStep === 2 && (!formData.name || !formData.username)) ||
                (currentStep === 3 && (!spaceData.spaceName || !spaceData.spaceUrl)) ||
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-purple-700'
              }`}
              disabled={
                (currentStep === 1 && !selectedOption) ||
                (currentStep === 2 && (!formData.name || !formData.username)) ||
                (currentStep === 3 && (!spaceData.spaceName || !spaceData.spaceUrl)) ||
                loading
              }
            >
              {loading ? 'Loading...' : currentStep === 4 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
        {/* Right Section */}
        <div className="md:col-span-5 col-span-1 h-full w-full flex items-center justify-center">
          <div className="rounded-2xl shadow-lg bg-card/80 border border-border w-11/12 md:w-4/5 h-64 md:h-4/5 flex items-center justify-center">
            {/* Right side content/image would go here */}
          </div>
        </div>
      </div>
    </main>
  );
}