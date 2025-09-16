import React from 'react';
import { Crown, Coffee, Sparkles, Target, Users, Star } from 'lucide-react';
import nithin from '../assets/images/nithin.png';
import vinay from '../assets/images/vinay.png';
import varun from '../assets/images/varun.png';
import swathy from '../assets/images/swathy.png';

const Team = () => {
  const teamMembers = [ 
    { 
      name: 'Nithin T', 
      role: 'Boss of Bosses', 
      image: nithin, 
      icon: Crown,
      description: 'Visionary leader driving innovation'
    },
    { 
      name: 'Vinay Thapa', 
      role: 'Snack Time Specialist', 
      image: vinay, 
      icon: Coffee,
      description: 'Fueling productivity one snack at a time'
    },
    { 
      name: 'Varun Nandan', 
      role: 'Corporate Gandalf', 
      image: varun, 
      icon: Sparkles,
      description: 'You shall not pass... bad code'
    },
    { 
      name: 'Swathy N', 
      role: 'Manager of Chaos', 
      image: swathy, 
      icon: Target,
      description: 'Turning chaos into organized success'
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-br from-indigo-900 via-blue-900 to-green-800 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 sphere1 animate-pulse-slow opacity-10"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 sphere1 animate-bounce-slow-late opacity-15"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
            <Users className="w-4 h-4 mr-2 text-blue-400" />
            Meet Our Team
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-extrabold textbackground mb-6">
            The Dream Team
          </h2>
          <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Meet the talented individuals behind our productivity revolution. 
            Each bringing their unique magic to make your workflows seamless.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group relative contextboxbackground rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl"
            >
              {/* Card background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative text-center">
                {/* Profile Image */}
                <div className="mb-6 relative">
                  <div className="w-24 h-24 mx-auto relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full rounded-full border-4 border-white/20 shadow-xl group-hover:border-white/40 transition-all duration-500"
                    />
                    {/* Icon overlay */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <member.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white contextboxtextshadow group-hover:textbackground transition-all duration-300">
                    {member.name}
                  </h3>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400 opacity-80" />
                    <p className="text-sm font-medium text-white/90">
                      {member.role}
                    </p>
                  </div>
                  
                  <p className="text-sm text-white/70 leading-relaxed">
                    {member.description}
                  </p>
                </div>
                
                {/* Hover effect decoration */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom stats or call to action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center space-x-8 contextboxbackground rounded-2xl p-6 border border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white textbackground">4</div>
              <div className="text-sm text-white/70">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white textbackground">∞</div>
              <div className="text-sm text-white/70">Innovation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white textbackground">100%</div>
              <div className="text-sm text-white/70">Awesome</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
