// Default workflows that auto-load on page refresh
export const DEFAULT_WORKFLOWS = [
  { id: '019956fa-eb1f-700b-8c47-a9ae53236c23', title: 'Important Emails', dashboardType: 'email' },
  { id: '01995738-d264-700b-8d31-e9342843f854', title: 'Follow Up Emails', dashboardType: 'email' },
  { id: '01995bcf-929f-78e3-bc98-38da52f3a11c', title: 'PRs you need to Review', dashboardType: 'github' },
  { id: '01995bd3-a553-78e3-a05e-6cf0ab94d14d', title: 'PRs you raised', dashboardType: 'github' },
  { id: '01995b71-bdbb-78e3-949d-51f2df429e8a', title: 'Follow-Up slack messages', dashboardType: 'slack' }
  // { id: '01995d41-1a9c-7629-b630-4b98562accdc', title: 'AI Hub Tasks', dashboardType: 'aihub' }
];

// API configuration
export const API_CONFIG = {
  BASE_URL: 'https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub',
  HEADERS: {
    'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
    'ib-context': 'ibhack008',
    'Content-Type': 'application/json'
  }
};
