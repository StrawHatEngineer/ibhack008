import React from 'react'

const About = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
      <h1 className="text-4xl font-bold mb-4 animate-bounce">About Us</h1>
      <p className="text-lg max-w-2xl text-center leading-relaxed animate-fadeIn">
        Welcome to our company! We are dedicated to providing the best services to our clients. Our team of experts is committed to excellence and innovation. Join us on our journey to make a difference in the world.
      </p>
      <div className="mt-8">
        <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 ease-in-out animate-pulse">
          Learn More
        </button>
      </div>
    </div>
  )
}

export default About