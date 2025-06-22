'use client'

import { useState } from 'react'
import { logger } from '@/lib/utils/logger'

interface Channel {
  id: string
  name: string
  description: string
  isAdult: boolean
}

const channels: Channel[] = [
  {
    id: 'cosmic',
    name: 'Cosmic Visuals',
    description: 'Journey through space and time',
    isAdult: false
  },
  {
    id: 'quantum',
    name: 'Quantum Sim',
    description: 'Interactive quantum simulations',
    isAdult: false
  },
  {
    id: 'bigbang',
    name: 'Big Bang Cinema',
    description: 'Ultra-cinematic cosmic origin story',
    isAdult: false
  }
]

interface ChannelSelectorProps {
  currentChannel: string
  onChannelChange: (channelId: string) => void
}

export default function ChannelSelector({ currentChannel, onChannelChange }: ChannelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel px-4 py-2 text-sm font-medium neon-text hover:bg-white/10 transition-colors"
      >
        Channel: {channels.find(c => c.id === currentChannel)?.name || 'Unknown'}
        <span className="ml-2">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 glass-panel p-2 z-20">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => {
                onChannelChange(channel.id)
                setIsOpen(false)
                logger.info('Channel switched', { channel: channel.name, id: channel.id })
              }}
              className={`w-full text-left p-3 rounded hover:bg-white/10 transition-colors ${
                currentChannel === channel.id ? 'bg-cyan-900/30 border-l-2 border-cyan-400' : ''
              }`}
            >
              <div className="font-medium text-cyan-300">{channel.name}</div>
              <div className="text-xs text-gray-400 mt-1">{channel.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}