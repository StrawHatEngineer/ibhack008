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

        // Categorize by widget title/type
        const title = widget.title.toLowerCase();
        if (title.includes('email') || title.includes('mail')) {
          emailTasks += taskCount;
        } else if (title.includes('slack') || title.includes('message')) {
          slackTasks += taskCount;
        } else if (title.includes('github') || title.includes('git')) {
          githubTasks += taskCount;
        } else {
          customTasks += taskCount;
        }
      } else if (widget.content && typeof widget.content === 'object') {
        // Single item content
        totalTasks += 1;
        const title = widget.title.toLowerCase();
        if (title.includes('email') || title.includes('mail')) {
          emailTasks += 1;
        } else if (title.includes('slack') || title.includes('message')) {
          slackTasks += 1;
        } else if (title.includes('github') || title.includes('git')) {
          githubTasks += 1;
        } else {
          customTasks += 1;
        }
      }
    });

    // Calculate completed tasks from stored completed items
    const completedTasks = 
      activityStats.completedItems.email.size + 
      activityStats.completedItems.slack.size + 
      activityStats.completedItems.github.size + 
      activityStats.completedItems.custom.size;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const todayCompleted = Math.floor(completedTasks * 0.6); // Simulate today's completion
    const thisWeekCompleted = completedTasks;

    setActivityStats(prev => ({
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
    }));
  }, [activityStats.completedItems]);

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
    setWidgets(newWidgets);
    calculateActivityStats(newWidgets);
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
