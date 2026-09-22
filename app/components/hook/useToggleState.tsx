"use client"
import { useState } from "react"




const useToggleState = (initialState = false) => {
  const [state, setState] = useState<boolean>(initialState)

  const close = () => {
    setState(false)
  }

  const open = () => {
    setState(true)
  }

  const toggle = () => {
    setState((state) => !state)
  }

  const hookData:any = [state, open, close, toggle] 
  hookData.state = state
  hookData.open = open
  hookData.close = close
  hookData.toggle = toggle
  return hookData
}

export default useToggleState
