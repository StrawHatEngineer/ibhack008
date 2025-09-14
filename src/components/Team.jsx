import React from 'react';

const Team = () => {
  const teamMembers = [
    { name: 'Nithin T', role: 'Boss of Bosses' },
    { name: 'Vinay Thapa', role: 'Snack Time Specialist' },
    { name: 'Varun Nandan', role: 'Corporate Gandalf' },
    { name: 'Swathy N', role: 'Manager of Chaos' },
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
              className="bg-gradient-to-r from-yellow-200 via-red-200 to-pink-200 p-8 rounded-lg shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 transition duration-300 ease-in-out hover:text-red-500">
                  {member.name}
                </h3>
                <p className="mt-2 text-gray-700 transition duration-300 ease-in-out hover:text-red-400">
                  {member.role}
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
