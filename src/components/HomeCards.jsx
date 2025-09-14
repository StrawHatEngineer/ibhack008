import React from "react";

const HomeCards = () => {
  return (
    <section class="py-4">
      <div class="container-xl lg:container m-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <div class="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold">Productivity OS</h2>
            <p class="mt-2 mb-4">
              Your productivity companion to help you priotirise your emails, slack messages or any other tasks.
            </p>
            <a
              href="/"
              class="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700"
            >
              Get Started
            </a>
          </div>
          <div class="bg-indigo-100 p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold">Team</h2>
            <p class="mt-2 mb-4">
              Meet the talented individuals behind our success.
            </p>
            <a
              href="/team"
              class="inline-block bg-indigo-500 text-white rounded-lg px-4 py-2 hover:bg-indigo-600"
            >
              Meet the Team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCards;
