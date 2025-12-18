"use client"

import { useEffect, useState } from "react"

export function useChatPinned() {
  const [isChatPinnedLeft, setIsChatPinnedLeft] = useState(false)
  const [isChatPinnedRight, setIsChatPinnedRight] = useState(false)

  useEffect(() => {
    const body = document.body

    const update = () => {
      setIsChatPinnedLeft(body.classList.contains("chat-pinned-left"))
      setIsChatPinnedRight(body.classList.contains("chat-pinned-right"))
    }

    update()

    const observer = new MutationObserver(update)
    observer.observe(body, { attributes: true, attributeFilter: ["class"] })

    return () => observer.disconnect()
  }, [])

  return { isChatPinnedLeft, isChatPinnedRight }
}
