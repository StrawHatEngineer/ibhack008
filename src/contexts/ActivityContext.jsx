import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Create the Activity Context
const ActivityContext = createContext();

// Activity Context Provider
export const ActivityProvider = ({ children }) => {
  const [activityStats, setActivityStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    emailTasks: 0,
    slackTasks: 0,
    githubTasks: 0,
    customTasks: 0,
    completionRate: 0,
    todayCompleted: 0,
    thisWeekCompleted: 0,
    totalDashboards: 3,
    // Track individual completed items by type and ID
    completedItems: {
      email: new Set(),
      slack: new Set(), 
      github: new Set(),
      custom: new Set()
    }
  });

  const [widgets, setWidgets] = useState([]);

  // Calculate stats based on real widget data - memoized for performance
  const calculateActivityStats = useCallback((widgetData) => {
    if (!widgetData || !Array.isArray(widgetData)) {
      return;
    }

    let totalTasks = 0;
    let emailTasks = 0;
    let slackTasks = 0;
    let githubTasks = 0;
    let customTasks = 0;

    widgetData.forEach(widget => {
      if (widget.content && Array.isArray(widget.content)) {
        const taskCount = widget.content.length;
        totalTasks += taskCount;

        // Categorize by widget title/type and dashboardId
        const title = widget.title.toLowerCase();
        const dashboardId = widget.dashboardId;
        
        // Use dashboardId for more accurate categorization if available
        if (dashboardId === 'dashboard-1' || title.includes('email') || title.includes('mail')) {
          emailTasks += taskCount;
        } else if (dashboardId === 'dashboard-3' || title.includes('slack') || title.includes('message')) {
          slackTasks += taskCount;
        } else if (dashboardId === 'dashboard-2' || title.includes('github') || title.includes('git') || title.includes('pull') || title.includes('commit') || title.includes('issue') || title.includes('repo')) {
          githubTasks += taskCount;
        } else {
          customTasks += taskCount;
        }
      } else if (widget.content && typeof widget.content === 'object' && Object.keys(widget.content).length > 0) {
        // Single item content
        totalTasks += 1;
        const title = widget.title.toLowerCase();
        const dashboardId = widget.dashboardId;
        
        // Use dashboardId for more accurate categorization if available
        if (dashboardId === 'dashboard-1' || title.includes('email') || title.includes('mail')) {
          emailTasks += 1;
        } else if (dashboardId === 'dashboard-3' || title.includes('slack') || title.includes('message')) {
          slackTasks += 1;
        } else if (dashboardId === 'dashboard-2' || title.includes('github') || title.includes('git') || title.includes('pull') || title.includes('commit') || title.includes('issue') || title.includes('repo')) {
          githubTasks += 1;
        } else {
          customTasks += 1;
        }
      } else if (widget.content && typeof widget.content === 'string' && widget.content.trim() !== '') {
        // String content - count lines
        const lines = widget.content.split('\n').filter(line => line.trim()).length;
        totalTasks += lines;
        
        const title = widget.title.toLowerCase();
        const dashboardId = widget.dashboardId;
        
        // Use dashboardId for more accurate categorization if available
        if (dashboardId === 'dashboard-1' || title.includes('email') || title.includes('mail')) {
          emailTasks += lines;
        } else if (dashboardId === 'dashboard-3' || title.includes('slack') || title.includes('message')) {
          slackTasks += lines;
        } else if (dashboardId === 'dashboard-2' || title.includes('github') || title.includes('git') || title.includes('pull') || title.includes('commit') || title.includes('issue') || title.includes('repo')) {
          githubTasks += lines;
        } else {
          customTasks += lines;
        }
      }
    });

    setActivityStats(prev => {
      // Calculate completed tasks from stored completed items using current state
      const completedTasks = 
        prev.completedItems.email.size + 
        prev.completedItems.slack.size + 
        prev.completedItems.github.size + 
        prev.completedItems.custom.size;

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const todayCompleted = Math.floor(completedTasks * 0.6); // Simulate today's completion
      const thisWeekCompleted = completedTasks;

      // Debug logging to help verify activity stats are being calculated
      console.log('Activity Stats Updated:', {
        totalTasks,
        emailTasks,
        slackTasks,
        githubTasks,
        customTasks,
        completedTasks,
        completionRate,
        widgetCount: widgetData.length,
        widgetsWithContent: widgetData.filter(w => 
          (Array.isArray(w.content) && w.content.length > 0) ||
          (typeof w.content === 'object' && w.content && Object.keys(w.content).length > 0) ||
          (typeof w.content === 'string' && w.content.trim() !== '')
        ).length
      });

      return {
        ...prev,
        totalTasks,
        completedTasks,
        emailTasks,
        slackTasks,
        githubTasks,
        customTasks,
        completionRate,
        todayCompleted,
        thisWeekCompleted
      };
    });
  }, []); // Remove dependency on completedItems to avoid circular dependency

  // Mark item as completed - memoized
  const markItemCompleted = useCallback((type, widgetId, itemIndex) => {
    const itemKey = `${widgetId}-${itemIndex}`;
    
    setActivityStats(prev => {
      const newCompletedItems = { ...prev.completedItems };
      newCompletedItems[type] = new Set([...newCompletedItems[type], itemKey]);
      
      // Recalculate completion stats
      const newCompletedTasks = 
        newCompletedItems.email.size + 
        newCompletedItems.slack.size + 
        newCompletedItems.github.size + 
        newCompletedItems.custom.size;

      const newCompletionRate = prev.totalTasks > 0 ? Math.round((newCompletedTasks / prev.totalTasks) * 100) : 0;
      const newTodayCompleted = Math.floor(newCompletedTasks * 0.6);

      return {
        ...prev,
        completedItems: newCompletedItems,
        completedTasks: newCompletedTasks,
        completionRate: newCompletionRate,
        todayCompleted: newTodayCompleted,
        thisWeekCompleted: newCompletedTasks
      };
    });
  }, []);

  // Check if item is completed - memoized
  const isItemCompleted = useCallback((type, widgetId, itemIndex) => {
    const itemKey = `${widgetId}-${itemIndex}`;
    return activityStats.completedItems[type].has(itemKey);
  }, [activityStats.completedItems]);

  // Update widgets data - memoized and debounced
  const updateWidgets = useCallback((newWidgets) => {
    console.log('ActivityContext: updateWidgets called with', newWidgets.length, 'widgets');
    setWidgets(newWidgets);
    // Add a small delay to ensure the widgets state is updated before calculating stats
    setTimeout(() => {
      calculateActivityStats(newWidgets);
    }, 0);
  }, [calculateActivityStats]);

  // Reset all completed items (for testing or reset functionality)
  const resetCompletedItems = () => {
    setActivityStats(prev => ({
      ...prev,
      completedItems: {
        email: new Set(),
        slack: new Set(),
        github: new Set(),
        custom: new Set()
      },
      completedTasks: 0,
      completionRate: 0,
      todayCompleted: 0,
      thisWeekCompleted: 0
    }));
  };

  // Memoize the value object to prevent unnecessary re-renders
  const value = useMemo(() => ({
    activityStats,
    markItemCompleted,
    isItemCompleted,
    updateWidgets,
    resetCompletedItems,
    calculateActivityStats
  }), [activityStats, markItemCompleted, isItemCompleted, updateWidgets, resetCompletedItems, calculateActivityStats]);

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};

// Custom hook to use the Activity Context
export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export default ActivityContext;
