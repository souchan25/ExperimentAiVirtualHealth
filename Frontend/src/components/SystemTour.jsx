import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, AlertCircle, Bell, Layout, Activity, MessageSquare, ShieldAlert, Terminal, Zap } from 'lucide-react';

const Tooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
}) => {
  return (
    <motion.div
      {...tooltipProps}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm border border-emerald-100 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-4">
        <button {...closeProps} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
          {step.icon || <Sparkles size={20} />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">
            {step.title || 'Quick Tip'}
          </h3>
          <div className="flex gap-1 mt-1">
            {[...Array(step.stepCount || 5)].map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? 'w-4 bg-emerald-500' : 'w-2 bg-emerald-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="text-gray-600 leading-relaxed mb-6">
        {step.content}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          {...skipProps}
          className="text-gray-400 hover:text-gray-600 font-semibold text-sm transition-colors"
        >
          Skip Tour
        </button>

        <div className="flex gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 flex items-center gap-1 transition-all"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <button
            {...primaryProps}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 flex items-center gap-2 transition-all transform active:scale-95"
          >
            {isLastStep ? 'Finish' : 'Got it!'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SystemTour = ({ role }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour if it hasn't been completed before for this role
    const tourCompleted = localStorage.getItem(`tour_completed_${role}`);
    if (!tourCompleted) {
      setRun(true);
    }
  }, [role]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(`tour_completed_${role}`, 'true');
    }
  };

  const studentSteps = [
    {
      target: '[data-tour="branding"]',
      title: "Hi there! 👋",
      content: "I'm your CPSU Health buddy. I'll show you around so you can easily find what you need!",
      placement: 'bottom',
      disableBeacon: true,
      icon: <Sparkles />,
      stepCount: 6,
    },
    {
      target: '[data-tour="sidebar-toggle"]',
      title: "Your Shortcut 🚀",
      content: "This menu helps you jump to different tools. Need to chat with our AI or track symptoms? It's all here!",
      placement: 'right',
      icon: <Layout />,
      stepCount: 6,
    },
    {
      target: '[data-tour="notifications"]',
      title: "Stay Notified! 🔔",
      content: "I'll put a little red dot here when there's something new for you to check out. No more missing updates!",
      placement: 'bottom',
      icon: <Bell />,
      stepCount: 6,
    },
    {
      target: '[data-tour="sos-button"]',
      title: "Need Help Fast? 🆘",
      content: "If you're feeling unwell or there's an emergency on campus, just tap this. We're here for you!",
      placement: 'bottom',
      icon: <AlertCircle className="text-red-500" />,
      stepCount: 6,
    },
    {
      target: '[data-tour="wellness-card"]',
      title: "How are you? 😊",
      content: "A quick daily check-in here helps us understand how you're doing. It only takes a second!",
      placement: 'top',
      icon: <Activity />,
      stepCount: 6,
    },
    {
      target: '[data-tour="health-insights"]',
      title: "Smart Insights 🧠",
      content: "Our AI helps explain your health reports in simple words, so you always know what's going on.",
      placement: 'top',
      icon: <MessageSquare />,
      stepCount: 6,
    },
  ];

  const staffSteps = [
    {
      target: '[data-tour="branding"]',
      title: "Welcome, Staff! 🏥",
      content: "Ready to help our students? Here's a quick look at your tools for today.",
      placement: 'bottom',
      disableBeacon: true,
      icon: <Sparkles />,
      stepCount: 6,
    },
    {
      target: '[data-tour="sidebar-toggle"]',
      title: "Navigation 🗺️",
      content: "Use this toggle to expand your sidebar. You can easily switch between consultations, inventory, and reports.",
      placement: 'right',
      icon: <Layout />,
      stepCount: 6,
    },
    {
      target: '[data-tour="staff-stats"]',
      title: "At a Glance 📊",
      content: "Monitor patient numbers and active alarms right here. This gives you a quick summary of the clinic's current state.",
      placement: 'bottom',
      icon: <Activity />,
      stepCount: 6,
    },
    {
      target: '[data-tour="emergency-response"]',
      title: "Emergency Hub 🚨",
      content: "Critical alerts appear here in real-time. You can quickly acknowledge and resolve emergencies from this panel.",
      placement: 'top',
      icon: <AlertCircle className="text-red-500" />,
      stepCount: 6,
    },
    {
      target: '[data-tour="management-console"]',
      title: "Action Center 🛠️",
      content: "Need to manage records or schedule appointments? Your most frequent tasks are grouped right here for easy access.",
      placement: 'left',
      icon: <Layout />,
      stepCount: 6,
    },
    {
      target: '[data-tour="notifications"]',
      title: "Stay Updated 🔔",
      content: "Check here for system alerts and important administrative notifications.",
      placement: 'bottom',
      icon: <Bell />,
      stepCount: 6,
    },
  ];

  const adminSteps = [
    {
      target: '[data-tour="branding"]',
      title: "Admin Control 🛡️",
      content: "Welcome to the system's heart. You have full control over users and health monitoring.",
      placement: 'bottom',
      disableBeacon: true,
      icon: <ShieldAlert />,
      stepCount: 5,
    },
    {
      target: '[data-tour="admin-actions"]',
      title: "Quick Actions ⚡",
      content: "Create new staff accounts or manage existing users instantly from these shortcuts.",
      placement: 'bottom',
      icon: <Zap />,
      stepCount: 5,
    },
    {
      target: '[data-tour="system-activity"]',
      title: "Live Logs 📜",
      content: "Keep an eye on system activity in real-time. Everything from database syncs to auth events is logged here.",
      placement: 'top',
      icon: <Terminal />,
      stepCount: 5,
    },
    {
      target: '[data-tour="security-pulse"]',
      title: "Security Status 🔒",
      content: "Check your SSL status and other security markers here to ensure the platform remains secure.",
      placement: 'top',
      icon: <ShieldAlert />,
      stepCount: 5,
    },
    {
      target: '[data-tour="notifications"]',
      title: "System Alerts 🔔",
      content: "Important system-wide notifications will appear here for your immediate review.",
      placement: 'bottom',
      icon: <Bell />,
      stepCount: 5,
    },
  ];

  const getSteps = () => {
    switch (role) {
      case 'staff': return staffSteps;
      case 'admin': return adminSteps;
      default: return studentSteps;
    }
  };

  const steps = getSteps();

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress={false} // Hidden as we use custom progress bar
      showSkipButton
      steps={steps}
      tooltipComponent={Tooltip}
      styles={{
        options: {
          overlayColor: 'rgba(0, 50, 20, 0.4)',
          primaryColor: '#10b981',
          zIndex: 1000,
        },
        spotlight: {
          borderRadius: '1.5rem',
          boxShadow: '0 0 0 2000px rgba(0, 0, 0, 0.4), 0 0 15px 5px rgba(16, 185, 129, 0.5)',
        }
      }}
      locale={{
        last: 'Finish Tour',
        skip: 'Skip Tour',
      }}
    />
  );
};

export default SystemTour;
