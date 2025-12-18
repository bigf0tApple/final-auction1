"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ethers } from "ethers"

type EnsSubgraphResponse = {
  data?: {
    domains?: Array<{
      name?: string | null
    }>
  }
}

interface DisplayNameModalProps {
  connectedWallet: string
  onSave: (name: string) => void
  onCancel: () => void
  isDark: boolean
  currentName?: string
  lockedUntil?: number
}

export default function DisplayNameModal({ connectedWallet, onSave, onCancel, isDark, currentName, lockedUntil }: DisplayNameModalProps) {
  const [selectedOption, setSelectedOption] = useState<"prefix" | "suffix" | "ens">("prefix")
  const [ensNames, setEnsNames] = useState<string[]>([])
  const [ensLoading, setEnsLoading] = useState(false)
  const [selectedEnsName, setSelectedEnsName] = useState<string>("")

  const isLocked = useMemo(() => {
    if (!lockedUntil) return false
    return Date.now() < lockedUntil
  }, [lockedUntil])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setEnsLoading(true)
      const names = new Set<string>()

      try {
        const ethereum = (window as unknown as { ethereum?: ethers.providers.ExternalProvider }).ethereum
        if (typeof window !== "undefined" && ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum)
          const reverse = await provider.lookupAddress(connectedWallet)
          if (reverse) names.add(reverse)
        }
      } catch {
        // ignore
      }

      try {
        const res = await fetch("https://api.thegraph.com/subgraphs/name/ensdomains/ens", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            query:
              "query($owner: String!) { domains(first: 10, where: { owner: $owner }, orderBy: name, orderDirection: asc) { name } }",
            variables: { owner: connectedWallet.toLowerCase() },
          }),
        })

        if (res.ok) {
          const data: EnsSubgraphResponse = await res.json()
          const domainNames = (data.data?.domains ?? []).map((d) => d.name).filter(Boolean)
          for (const name of domainNames) {
            if (typeof name === "string" && name.endsWith(".eth")) names.add(name)
          }
        }
      } catch {
        // ignore
      }

      const next = Array.from(names)
      if (cancelled) return
      setEnsNames(next)
      setSelectedEnsName(next[0] ?? "")
      setEnsLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [connectedWallet])

  const displayNamePreview = useMemo(() => {
    switch (selectedOption) {
      case "prefix":
        return `${connectedWallet.slice(0, 6)}...`
      case "suffix":
        return `...${connectedWallet.slice(-4)}`
      case "ens":
        return selectedEnsName || `${connectedWallet.slice(0, 6)}...`
    }
  }, [connectedWallet, selectedEnsName, selectedOption])

  const handleSave = () => {
    onSave(displayNamePreview)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${isDark ? "bg-[#000000] border-white" : "bg-white border-black"} border rounded-2xl p-6 max-w-md w-full mx-4`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>Select Your Display Name</h3>
          <Button onClick={onCancel} variant="ghost" className={`p-1 ${isDark ? "text-white" : "text-black"}`}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Choose how you want to be identified in the auction chat.
        </p>

        {currentName && isLocked && (
          <div className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Display name changes are locked for 24 hours.
          </div>
        )}

        <div className="space-y-4 mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="displayName"
              value="prefix"
              checked={selectedOption === "prefix"}
              onChange={() => setSelectedOption("prefix")}
              className="w-4 h-4"
            />
            <span className={`${isDark ? "text-white" : "text-black"}`}>
              Address Prefix ({connectedWallet.slice(0, 6)}...)
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="displayName"
              value="suffix"
              checked={selectedOption === "suffix"}
              onChange={() => setSelectedOption("suffix")}
              className="w-4 h-4"
            />
            <span className={`${isDark ? "text-white" : "text-black"}`}>
              Address Suffix (...{connectedWallet.slice(-4)})
            </span>
          </label>

          {(ensLoading || ensNames.length > 0) && (
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="displayName"
                value="ens"
                checked={selectedOption === "ens"}
                onChange={() => setSelectedOption("ens")}
                className="w-4 h-4"
              />
              <span className={`${isDark ? "text-white" : "text-black"}`}>
                {ensLoading ? "Scanning ENS…" : ensNames.length === 1 ? `ENS Name (${ensNames[0]})` : "ENS Name"}
              </span>
            </label>
          )}

          {selectedOption === "ens" && !ensLoading && ensNames.length > 1 && (
            <div className="pl-7">
              <select
                value={selectedEnsName}
                onChange={(e) => setSelectedEnsName(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm ${isDark ? "bg-[#000000] border-white text-white" : "bg-white border-black text-black"}`}
              >
                {ensNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className={`flex-1 ${isDark ? "bg-[#000000] border-white text-white hover:bg-white hover:text-black" : "bg-white border-black text-black hover:bg-black hover:text-white"} rounded-lg`}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={Boolean(currentName) && isLocked && displayNamePreview !== currentName}
            className={`flex-1 ${isDark ? "bg-white text-black border-2 border-black hover:bg-black hover:text-white hover:border-white" : "bg-black text-white border-2 border-white hover:bg-white hover:text-black hover:border-black"} rounded-lg`}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
