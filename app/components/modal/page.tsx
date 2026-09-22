"use client"
import { useState } from "react";

export default function page() {
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle modal
  const toggleModal = () => setIsOpen(!isOpen);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {/* Open Modal Button */}
      <button 
        onClick={toggleModal} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Open Modal
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
          onClick={toggleModal} // Close modal when clicking outside
        >
          <div 
            className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6 relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Modal Header */}
            <div className="flex items-center pb-3 border-b border-gray-300">
              <h3 className="text-gray-800 text-xl font-bold flex-1">Modal Title</h3>
              <svg 
                onClick={toggleModal} 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-4 h-4 ml-2 cursor-pointer fill-gray-400 hover:fill-red-500"
                viewBox="0 0 320.591 320.591"
              >
                <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"></path>
                <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"></path>
              </svg>
            </div>

            {/* Modal Content */}
            <div className="my-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                This is a sample modal. You can customize the content.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-300 pt-6 flex justify-end gap-4">
              <button 
                onClick={toggleModal} 
                className="px-4 py-2 rounded-lg text-gray-800 text-sm bg-gray-200 hover:bg-gray-300">
                Close
              </button>
              <button className="px-4 py-2 rounded-lg text-white text-sm bg-blue-600 hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
