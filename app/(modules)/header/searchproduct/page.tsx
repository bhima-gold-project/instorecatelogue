"use client"

import { MoveRight, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

const SearchProduct = () => {
  const [productID, setProductID] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("search_history") || "[]")
    setHistory(stored)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const saveSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    const filtered = history.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())
    const updated = [trimmed, ...filtered].slice(0, 10)
    localStorage.setItem("search_history", JSON.stringify(updated))
    setHistory(updated)
  }

  const removeItem = (e: React.MouseEvent, value: string) => {
    e.stopPropagation()
    const updated = history.filter((item) => item !== value)
    localStorage.setItem("search_history", JSON.stringify(updated))
    setHistory(updated)
  }

  const fetchProduct = async () => {
    if (productID.trim() === "") {
      alert("Please Enter Search Term")
      return
    }
    saveSearch(productID)
    setShowDropdown(false)
    router.push(`/search?q=${encodeURIComponent(productID.trim())}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent the default action of the Enter key
      fetchProduct()
    }
  }

  const handleSuggestionClick = (item: string) => {
    setProductID(item)
    saveSearch(item)
    setShowDropdown(false)
    router.push(`/search?q=${encodeURIComponent(item)}`)
  }

  const filteredSuggestions = history.filter((item) =>
    item.toLowerCase().includes(productID.toLowerCase())
  )

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex w-full items-center bg-[#FAF7F2] border border-[#E8E1D5] rounded-full pl-5 pr-1 py-1 hover:border-[#D5C9B3] transition-colors focus-within:border-[#C8B89C] focus-within:ring-1 focus-within:ring-[#C8B89C]/30">
        <input
          placeholder="Search Product..."
          value={productID}
          onChange={(e) => {
            setProductID(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent h-8 text-sm text-[#4A4740] placeholder-[#A39E93] focus:outline-none"
        />
        {productID.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setProductID("")
              setShowDropdown(true)
            }}
            className="text-gray-400 hover:text-gray-600 mr-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={fetchProduct}
          className="flex items-center justify-center bg-[#2B4B3E] hover:bg-[#20372D] text-white rounded-full w-8 h-8 transition-colors shrink-0"
        >
          <MoveRight className="w-4 h-4" />
        </button>
      </div>

      {showDropdown && filteredSuggestions.length > 0 && (
        <div className="absolute top-12 left-0 w-[calc(100%-1.25rem)] bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(item)}
            >
              <div className="flex items-center gap-2 text-gray-700">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{item}</span>
              </div>
              <button
                onClick={(e) => removeItem(e, item)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Remove from history"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchProduct
