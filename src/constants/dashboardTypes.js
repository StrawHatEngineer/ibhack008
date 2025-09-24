import { Mail, MessageSquare, Github, Sparkles } from "lucide-react";
import EmailDashboard from "../components/EmailDashboard";
import SlackDashboard from "../components/SlackDashboard";
import GitHubDashboard from "../components/GitHubDashboard";
import CustomDashboard from "../components/dashboards/CustomDashboard";

// Available dashboard types configuration
export const DASHBOARD_TYPES = {
  email: {
    id: 'email',
    name: 'Email Dashboard',
    description: 'Manage and prioritize your email communications',
    icon: Mail,
    component: EmailDashboard,
    color: 'bg-blue-500'
  },
  slack: {
    id: 'slack', 
    name: 'Slack Dashboard',
    description: 'Streamline team communications and messages',
    icon: MessageSquare,
    component: SlackDashboard,
    color: 'bg-green-500'
  },
  github: {
    id: 'github',
    name: 'GitHub Dashboard', 
    description: 'Development task automation and workflow management',
    icon: Github,
    component: GitHubDashboard,
    color: 'bg-purple-500'
  },
  aihub: {
    id: 'aihub',
    name: 'AI Hub Dashboard',
    description: 'AI-powered workflow automation and intelligent task management',
    icon: Sparkles,
    component: CustomDashboard,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  },
  custom: {
    id: 'custom',
    name: 'Custom Dashboard',
    description: 'Build your own personalized dashboard with custom widgets',
    icon: Sparkles,
    component: CustomDashboard,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-600'
  }
};
