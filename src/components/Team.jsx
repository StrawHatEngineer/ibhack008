import React from 'react';

const Team = () => {
  const teamMembers = [
    { name: 'Nithin T', role: 'Manager' },
    { name: 'Vinay Thapa', role: 'Developer' },
    { name: 'Varun Nandan', role: 'Lead' },
    { name: 'Swathy', role: 'Manager' },
  ];

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Our Team</h2>
          <p className="mt-4 text-lg text-gray-600">
            Meet the talented individuals behind our success.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="mt-2 text-gray-600">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
