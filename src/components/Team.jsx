import React from 'react';
import nithin from '../assets/images/nithin.png';
import vinay from '../assets/images/vinay.png';
import varun from '../assets/images/varun.png';
import swathy from '../assets/images/swathy.png';

const Team = () => {
  const teamMembers = [ 
    { name: 'Nithin T', role: 'Boss of Bosses', image: nithin },
    { name: 'Vinay Thapa', role: 'Snack Time Specialist', image: vinay },
    { name: 'Varun Nandan', role: 'Corporate Gandalf', image: varun },
    { name: 'Swathy N', role: 'Manager of Chaos', image: swathy },
  ];

  return (
    <section className="pb-80 pt-40 bg-gradient-to-r from-green-400 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white">Our Team</h2>
          <p className="mt-4 text-xl text-gray-200">
            Meet the talented individuals behind our success.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-20 p-10 rounded-xl shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl backdrop-filter backdrop-blur-lg"
            >
              <div className="text-center no-wrap">
                <div className="mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-md transform transition duration-500 hover:scale-110"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-left transition duration-300 ease-in-out hover:text-red-500">
                  <i className="fas fa-user-tie mr-2 text-2xl"></i> {member.name}
                </h3>
                <p className="mt-2 text-gray-700 text-left transition duration-300 ease-in-out hover:text-red-400">
                  <i className="fas fa-briefcase mr-2 text-2xl"></i> {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
