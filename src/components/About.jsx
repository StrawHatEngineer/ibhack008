import React from 'react'
import { 
  Zap, 
  Target, 
  Shield, 
  Clock, 
  Users, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  Github, 
  BarChart3,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Mail,
      title: "Email Intelligence",
      description: "AI-powered email prioritization that learns your preferences and helps you focus on what matters most."
    },
    {
      icon: MessageSquare,
      title: "Slack Intelligence",
      description: "Never miss important team communications with intelligent message filtering and priority notifications."
    },
    {
      icon: Github,
      title: "GitHub Intelligence",
      description: "Streamline your development process with automated workflows and intelligent task management."
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save ∞ Hours Daily",
      description: "Reduce time spent on email and message management"
    },
    {
      icon: Target,
      title: "∞ Priority Accuracy",
      description: "AI learns your patterns for precise prioritization"
    },
    {
      icon: Shield,
      title: "Privacy Protection",
      description: "Bank-grade encryption and privacy protection"
    },
    {
      icon: BarChart3,
      title: "Productivity Tracking",
      description: "Track and optimize your workflow efficiency"
    }
  ];

  const values = [
    "Intelligent automation that adapts to your daily tasks",
    "Privacy-first approach with your data security",
    "Seamless integration with your existing tools",
    "Continuous learning and improvement"
  ];

  return (
    <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-green-800 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-40 left-20 w-96 h-96 sphere1 animate-pulse-slow opacity-10"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 sphere1 animate-bounce-slow opacity-15"></div>
        <div className="absolute top-20 right-40 w-64 h-64 sphere1 animate-bounce-slow-late opacity-10"></div>
      </div>

      <div className="relative min-h-screen py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
              About Productivity OS
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold textbackground mb-8 leading-tight">
              Revolutionizing
              <span className="block">Productivity</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
              We're on a mission to transform how professionals manage their daily tasks. 
              Our AI-powered platform brings order to the chaos of modern daily communication media, 
              helping you focus on what truly drives success.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="contextboxbackground rounded-xl p-6 border border-white/10 max-w-sm">
                <div className="text-3xl font-bold text-white textbackground mb-2">∞</div>
                <div className="text-white/70">Hours Saved Daily</div>
              </div>
              <div className="contextboxbackground rounded-xl p-6 border border-white/10 max-w-sm">
                <div className="text-3xl font-bold text-white textbackground mb-2">∞</div>
                <div className="text-white/70">User Satisfaction</div>
              </div>
              <div className="contextboxbackground rounded-xl p-6 border border-white/10 max-w-sm">
                <div className="text-3xl font-bold text-white textbackground mb-2">∞</div>
                <div className="text-white/70">Integrations</div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold textbackground mb-6">
                Core Capabilities
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Three powerful integrations united under one intelligent system
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group contextboxbackground rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white contextboxtextshadow mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold textbackground mb-6">
                Why Choose Us
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Measurable results that transform your productivity
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="contextboxbackground rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/5 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white contextboxtextshadow mb-2">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-sm text-white/70">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold textbackground mb-8">
                  Our Commitment
                </h2>
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  Built on principles that put your productivity and privacy first, 
                  our platform evolves with your needs while maintaining the highest 
                  standards of security and reliability.
                </p>

                <div className="space-y-4">
                  {values.map((value, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span className="text-white/90">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="contextboxbackground rounded-2xl p-8 border border-white/10">
                <div className="text-center">
                  <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white contextboxtextshadow mb-4">
                    Ready to Transform Your Workflow?
                  </h3>
                  <p className="text-white/70 mb-8">
                    Join thousands of professionals who have already revolutionized 
                    their productivity with our AI-powered platform.
                  </p>
                  
                  <button onClick={() => window.location.href = '/'} className="inline-flex items-center px-8 py-4 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg group">
                    Get Started Today
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="text-center">
            <div className="contextboxbackground rounded-2xl p-12 border border-white/10">
              <Users className="w-20 h-20 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold textbackground mb-4">
                Built by Productivity Experts
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
                Our team combines deep expertise in AI, workflow optimization, and user experience 
                to create tools that genuinely make your work life better.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => window.location.href = '/team'} className="inline-flex items-center px-6 py-3 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm">
                  <Users className="w-5 h-5 mr-2" />
                  Meet the Team
                </button>
                <button onClick={() => window.location.href = '/'} className="inline-flex items-center px-6 py-3 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Contact Us
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default About