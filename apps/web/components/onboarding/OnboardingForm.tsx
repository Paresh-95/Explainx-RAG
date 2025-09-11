"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingForm() {
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

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  const rightSideContent = {
    1: {
      title: "Join thousands of learners",
      subtitle: "Start your personalized learning journey today",
      content: (
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-4 max-w-sm mx-auto"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-purple-600 mb-1">10K+</div>
              <div className="text-sm text-gray-600">Active Learners</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-purple-600 mb-1">500+</div>
              <div className="text-sm text-gray-600">Courses</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-purple-600 mb-1">98%</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </motion.div>
        </div>
      )
    },
    2: {
      title: "Build your identity",
      subtitle: "Create a profile that showcases your learning achievements",
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm mx-auto"
        >
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{formData.name || 'Your Name'}</div>
                <div className="text-sm text-gray-500">@{formData.username || 'username'}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                <span>{selectedOption === 'learner' ? 'Learner' : 'Creator'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                <span>Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )
    },
    3: {
      title: "Organize your learning",
      subtitle: "Create spaces to categorize and track your progress",
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm mx-auto"
        >
          <div className="space-y-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{spaceData.spaceName || 'Your Space'}</div>
                    <div className="text-xs text-gray-500">/spaces/{spaceData.spaceUrl || 'your-space'}</div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {spaceData.description || 'Your personalized learning space'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-xs text-gray-600">Courses</div>
              </div>
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-xs text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </motion.div>
      )
    },
    4: {
      title: "Welcome aboard! 🎉",
      subtitle: "Your learning adventure begins now",
      content: (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/25"
          >
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-xs mx-auto">
            <div className="text-4xl mb-3">🎊</div>
            <h3 className="font-semibold text-gray-800 mb-2">You're all set!</h3>
            <p className="text-sm text-gray-600">
              Time to explore your personalized dashboard and start learning.
            </p>
          </div>
        </motion.div>
      )
    }
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-12 h-full">
        {/* Left Section */}
        <div className="md:col-span-7 h-full overflow-y-auto">
          <div className="min-h-full p-6 md:p-8 lg:p-12 flex flex-col">
            {/* Logo */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ExplainX
              </span>
            </motion.div>

            {/* Progress Bar */}
            <motion.div 
              className="w-full max-w-lg mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                {/* Background line */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 dark:bg-zinc-800 rounded-full"></div>
                {/* Active progress line */}
                <motion.div 
                  className="absolute top-4 left-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {/* Step indicators */}
                <div className="relative flex justify-between">
                  {[
                    { step: 1, label: 'Role' },
                    { step: 2, label: 'Profile' },
                    { step: 3, label: 'Space' },
                    { step: 4, label: 'Finish' }
                  ].map((item) => (
                    <motion.div 
                      key={item.step} 
                      className="flex flex-col items-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: item.step * 0.1 }}
                    >
                      <motion.div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                          currentStep >= item.step
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {currentStep > item.step ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          item.step
                        )}
                      </motion.div>
                      <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                        currentStep === item.step ? 'text-purple-600' : 
                        currentStep > item.step ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Form Content */}
            <div className="flex-1 w-full max-w-lg mx-auto">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      Tell us more about your work
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 mb-8">Let's tailor the system to your needs.</p>
                    <div className="space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOption('learner')}
                        className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 ${
                          selectedOption === 'learner'
                            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/30'
                            : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-500 bg-white dark:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100">I'm a Learner</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              Access personalized courses, quizzes, and track your progress.
                            </p>
                          </div>
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                              <motion.img
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                src={`https://i.pravatar.cc/100?img=${i + 3}`}
                                alt=""
                                className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900"
                              />
                            ))}
                          </div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOption('creator')}
                        className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 ${
                          selectedOption === 'creator'
                            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/30'
                            : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-500 bg-white dark:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100">I'm a Creator</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              Build and share your own learning content with the community.
                            </p>
                          </div>
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                              <motion.img
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                src={`https://i.pravatar.cc/100?img=${i}`}
                                alt=""
                                className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900"
                              />
                            ))}
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      Set up your profile
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 mb-8">Create your personalized learning profile.</p>
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-zinc-700 focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                          This will be displayed on your learning profile and certificates.
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          placeholder="Choose a unique username"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-zinc-700 focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                          Your profile will be available at: learn.explainx.ai/{formData.username || 'username'}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      Create Your First Space
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 mb-8">Create a space to start organizing your learning materials.</p>
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label htmlFor="spaceName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Space Name
                        </label>
                        <input
                          type="text"
                          id="spaceName"
                          value={spaceData.spaceName}
                          onChange={(e) => handleSpaceInputChange('spaceName', e.target.value)}
                          placeholder="e.g., JavaScript Fundamentals"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-zinc-700 focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                          Choose a descriptive name for your learning space.
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label htmlFor="spaceUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Space URL
                        </label>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 border-2 border-r-0 border-gray-200 dark:border-zinc-700 rounded-l-xl px-3 py-3">
                            learn.explainx.ai/spaces/
                          </span>
                          <input
                            type="text"
                            id="spaceUrl"
                            value={spaceData.spaceUrl}
                            onChange={(e) => handleSpaceInputChange('spaceUrl', e.target.value)}
                            placeholder="javascript-fundamentals"
                            className="flex-1 px-4 py-3 rounded-r-xl border-2 border-gray-200 dark:border-zinc-700 focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                          This will be your unique URL for the space.
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Description <span className="text-gray-400 dark:text-gray-500">(Optional)</span>
                        </label>
                        <textarea
                          id="description"
                          value={spaceData.description}
                          onChange={(e) => handleSpaceInputChange('description', e.target.value)}
                          placeholder="Describe what you'll be learning in this space..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-zinc-700 focus:border-purple-500 focus:outline-none transition-colors duration-200 resize-none bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">You're all set! 🎉</h1>
                    <p className="text-gray-500 dark:text-gray-300 mb-8">Welcome to your personalized learning journey.</p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-6"
                    >
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">What's next?</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Track your learning progress
                        </li>
                      </ul>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <motion.div 
              className="mt-8 flex justify-between items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  currentStep === 1
                    ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
                disabled={currentStep === 1 || loading}
              >
                Back
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (currentStep === 4) {
                    router.push('/dashboard');
                  } else {
                    handleNext();
                  }
                }}
                className={`px-8 py-2.5 rounded-xl font-medium transition-all ${
                  (currentStep === 1 && !selectedOption) ||
                  (currentStep === 2 && (!formData.name || !formData.username)) ||
                  (currentStep === 3 && (!spaceData.spaceName || !spaceData.spaceUrl)) ||
                  loading
                    ? 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-600/25'
                }`}
                disabled={
                  (currentStep === 1 && !selectedOption) ||
                  (currentStep === 2 && (!formData.name || !formData.username)) ||
                  (currentStep === 3 && (!spaceData.spaceName || !spaceData.spaceUrl)) ||
                  loading
                }
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : currentStep === 4 ? 'Go to Dashboard' : 'Next'}
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Right Section - Desktop Only */}
        <div className="hidden md:block md:col-span-5 h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 relative overflow-hidden">
          <div className="h-full flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {rightSideContent[currentStep as keyof typeof rightSideContent].content}
                <motion.h2 
                  className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-8 mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {rightSideContent[currentStep as keyof typeof rightSideContent].title}
                </motion.h2>
                <motion.p 
                  className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {rightSideContent[currentStep as keyof typeof rightSideContent].subtitle}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Background decorative elements - subtle and minimal */}
          <div className="absolute top-20 -right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        </div>
      </div>
    </main>
  );
}