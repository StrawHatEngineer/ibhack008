import React from 'react'
import { Mail, MessageSquare, Github, Zap, Target, BarChart3 } from 'lucide-react'

const Hero = () => {
  const features = [
    {
      icon: Mail,
      title: "Email Intelligence",
      description: "Smart email prioritization and management"
    },
    {
      icon: MessageSquare,
      title: "Slack Intelligence",
      description: "Smart Slack message prioritization and management"
    },
    {
      icon: Github,
      title: "GitHub Intelligence",
      description: "Smart GitHub PR, code review, and task management"
    }
  ];

  return (
    <div className="relative bg-gradient-to-br from-indigo-800 via-indigo-700 to-purple-800 py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 sphere1 animate-pulse-slow opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 sphere1 animate-bounce-slow opacity-15"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-4">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                Axis AI-Powered Productivity Platform
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold pb-4 textbackground leading-tight">
              Productivity
              <span className="block">OS</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
              Your intelligent productivity companion to help you prioritize emails, manage Slack communications, and streamline GitHub Code review, and task management—all in one unified dashboard.
            </p>
          </div>
          
          {/* Right Content - Feature Cards */}
          <div className="relative">
            <div className="grid gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="contextboxbackground rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-white/20 to-white/5 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white contextboxtextshadow">
                        {feature.title}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 contextboxbackground rounded-xl border border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white textbackground">∞</div>
                  <div className="text-sm text-white/70">Widgets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white textbackground">∞</div>
                  <div className="text-sm text-white/70">Integrations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white textbackground">Axis</div>
                  <div className="text-sm text-white/70">AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero