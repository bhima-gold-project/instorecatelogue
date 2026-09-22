"use client"

import React, { useState } from "react"

interface PopupProps {
  popup: boolean
  message: string
}

const RemoveFromCart: React.FC<PopupProps> = ({ popup, message }) => {
  const [popupVisible, setPopupVisible] = useState(popup)

//   React.useEffect(() => {
//     if (popup) {
//       setPopupVisible(true)
//       const timer = setTimeout(() => {
//         setPopupVisible(false)
//       }, 3000)

//       return () => clearTimeout(timer) // Clean up the timer
//     }
//   }, [popup])

  return (
    <div
      className="fixed top-10 left-1/2 transform -translate-x-1/2 mt-4 w-max z-50"
      style={{ visibility: popup ? "visible" : "hidden" }}
    >
      {popup && (
        <div
          className="relative bg-red-100 border shadow-[0_3px_10px_-3px_rgba(6,81,237,0.3)] text-black flex w-max max-w-sm rounded-md overflow-hidden"
          role="alert"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-red-500">
         < svg xmlns="http://www.w3.org/2000/svg" className="w-5 shrink-0 fill-white inline" viewBox="0 0 32 32">
                      <path
                          d="M16 1a15 15 0 1 0 15 15A15 15 0 0 0 16 1zm6.36 20L21 22.36l-5-4.95-4.95 4.95L9.64 21l4.95-5-4.95-4.95 1.41-1.41L16 14.59l5-4.95 1.41 1.41-5 4.95z"
                          data-original="#ea2d3f" />
                  </svg>
          </div>

          <div className="py-2 mx-4  flex justify-center items-center">
            <p className="text-sm text-red-800 font-semibold">{message}</p>
            {/* <p className="text-xs text-gray-400 mt-0.5">
              Some important information will appear here
            </p> */}
          </div>
        </div>
      )}
    </div>
  )
}

export default RemoveFromCart
