'use client';

import React, { useEffect, useState } from 'react';
import Joyride, { type CallBackProps, type Step, EVENTS, ACTIONS, STATUS } from 'react-joyride';
import { useAuthStore } from '@/lib/store';
import { setProfileTourCompleted } from '@/lib/api'; // API to update DB
import { Button } from '@/components/ui/Button'; // Assuming you have a Button component

// Helper to style the tooltip
const Tooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
}: any) => (
  <div {...tooltipProps} className="bg-neutral-800 text-neutral-100 p-4 rounded-lg shadow-xl max-w-sm border border-neutral-700 font-sans">
    {step.title && <h4 className="text-lg font-semibold mb-2 font-heading">{step.title}</h4>}
    <div className="text-sm mb-4">{step.content}</div>
    <div className="flex justify-between items-center">
      <div>
        {index > 0 && (
          <Button {...backProps} variant="outline" size="sm" className="mr-2">
            Back
          </Button>
        )}
      </div>
      <div className="space-x-2">
        {continuous && (
          <Button {...primaryProps} variant="primary" size="sm">
            Next
          </Button>
        )}
        {!continuous && ( // For the last step
          <Button {...primaryProps} variant="primary" size="sm">
            Finish
          </Button>
        )}
         <Button {...closeProps} variant="ghost" size="sm"> {/* Close button on all steps */}
          Close
        </Button>
      </div>
    </div>
  </div>
);


export function AppTour() {
  const { user, profile, markTourAsCompletedInStore, setProfile: setProfileInStore } = useAuthStore();
  const [runTour, setRunTour] = useState(false);

  const tourSteps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to Research Bee! We are excited to show you around. Let\'s get started!',
      placement: 'center',
      title: 'Welcome Aboard!',
      styles: {
        options: {
          width: '350px', // Make welcome modal a bit wider
        }
      }
    },
    {
      // Assuming your sidebar root element might have an ID or a very specific class
      target: '[data-testid="app-sidebar"] > div', // More specific: target the ProSidebar's inner div
      content: 'This is your command center! Access all major sections of the app from here: your dashboard, chats, matches, and more.',
      title: 'Main Navigation',
      placement: 'right',
    },
    {
      // Targeting the search input within the DashboardHeader
      target: '.sticky.top-0 input[type="search"]', // Targets search input in sticky header
      content: 'Looking for something specific? Use the global search to find researchers, projects, or keywords across the platform.',
      title: 'Global Search',
      placement: 'bottom',
    },
    {
      // Targeting the notifications bell icon in DashboardHeader
      target: '.sticky.top-0 a[href="/notifications"]',
      content: 'Stay updated! You\'ll find all your notifications here, from new messages to match suggestions.',
      title: 'Your Notifications',
      placement: 'bottom-end',
    },
    {
      // Targeting the profile dropdown trigger in DashboardHeader
      target: '.sticky.top-0 button[aria-label*="Avatar"], .sticky.top-0 button > img[alt*="User"], .sticky.top-0 button > svg[aria-label*="User"] ', // More robust selector for avatar button
      content: 'Access your profile, account settings, or log out from this menu.',
      title: 'Profile & Settings',
      placement: 'bottom-end',
    },
    {
        // Example: Targeting a main content area, perhaps on the dashboard.
        // You'll need to identify a stable selector for your main content display area.
        target: 'main > div > div:first-child', // A generic selector for the first main content block
        content: 'This is where the main content of each page will be displayed. For example, your dashboard feed, chat interfaces, or project details.',
        title: 'Main Content Area',
        placement: 'top',
    },
    {
        target: 'body', // Final step
        content: 'You\'re all set! Feel free to explore and start connecting. If you need help, look for help icons or visit our support section.',
        placement: 'center',
        title: 'Tour Complete!',
    }
  ];

  useEffect(() => {
    // Start the tour only if a user is logged in, has a profile, 
    // and has NOT completed the tour yet.
    if (user && profile && !profile.has_completed_tour) {
      // Small delay to ensure the UI is likely rendered
      const timer = setTimeout(() => {
        console.log('[AppTour] Conditions met, attempting to start tour.');
        setRunTour(true);
      }, 1500); 
      return () => clearTimeout(timer);
    } else {
      if (runTour) { // If tour was running but conditions no longer met (e.g. logout)
        console.log('[AppTour] Conditions no longer met, stopping tour if it was running.');
        setRunTour(false);
      }
    }
  }, [user, profile, runTour]); // runTour added to dependencies to handle external stop

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { action, index, status, type } = data;

    console.log('[AppTour] Joyride callback:', { action, index, status, type, step: data.step?.title });

    // Check if the event type is one we are interested in for step changes
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // console.log(`Current step index: ${index + (action === ACTIONS.PREV ? -1 : 1)}`);
    } 
    // Check if the tour status indicates completion or skipping
    else if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      console.log(`[AppTour] Tour ${status}. Marking as completed.`);
      
      if (user?.id && profile && !profile.has_completed_tour) { // Double check before DB update
        try {
          const updatedProfile = await setProfileTourCompleted(user.id);
          if (updatedProfile) {
            setProfileInStore(updatedProfile); // Update store with fresh profile from DB
            console.log('[AppTour] Tour completion saved to DB and store updated.');
          } else {
             // Fallback to optimistic update in store if DB update fails to return profile
            markTourAsCompletedInStore(); 
            console.warn('[AppTour] DB update for tour status might have failed to return profile, but marked in store.');
          }
        } catch (error) {
          console.error('[AppTour] Error saving tour completion status:', error);
          // Optimistically update in store anyway so user doesn't see tour again
          markTourAsCompletedInStore();
          console.warn('[AppTour] Tour completion status updated in store optimistically due to DB error.');
        }
      }
    }
  };
  
  // Do not render Joyride if not supposed to run or if essential data is missing
  if (!user || !profile) {
    // console.log('[AppTour] Will not render Joyride: No user or profile.');
    return null; 
  }

  // console.log(`[AppTour] Rendering Joyride component. Run state: ${runTour}, User: ${!!user}, Profile: ${!!profile}, HasCompletedTour: ${profile?.has_completed_tour}`);

  return (
    <Joyride
      steps={tourSteps}
      run={runTour}
      callback={handleJoyrideCallback}
      continuous
      showProgress
      showSkipButton
      // Pass the custom tooltip component
      tooltipComponent={Tooltip}
      styles={{
        options: {
          zIndex: 10000, // Ensure it's above other elements
          arrowColor: '#374151', // neutral-700
        },
        // Custom styles for specific elements if needed
        // modal: {}, // Styles for the modal like overlay
        // spotlight: {}, // Styles for the spotlight effect
      }}
      // Disable scrolling for the body when the tour is active.
      // This is often good, but ensure it doesn't break your layout.
      // disableScrollParentFix 
      // disableOverlayClose // Prevent closing by clicking overlay
      // spotlightClicks // Allow clicks on spotlighted elements
    />
  );
} 
 