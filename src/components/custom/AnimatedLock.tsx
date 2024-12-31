'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { createParticle } from '../utils/createParticle'

const COLORS = ['#f8b922', '#ce00cb', '#5b06be']

interface AnimatedLockProps {
  characterName: string;
  isLocked: boolean;
  onUnlockShown?: () => void;
}

export const AnimatedLock: React.FC<AnimatedLockProps> = ({ characterName, isLocked, onUnlockShown }) => {
  const [showLock, setShowLock] = useState(true)
  const [showParticles, setShowParticles] = useState(false)
  const [hasShownUnlock, setHasShownUnlock] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<any[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!isLocked && !hasShownUnlock) {
      setShowParticles(true)
      setTimeout(() => setShowLock(false), 3000)
      setTimeout(() => {
        setShowParticles(false)
        setHasShownUnlock(true)
        onUnlockShown?.();
      }, 8000)
    }
  }, [isLocked, hasShownUnlock, onUnlockShown])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.velocity.x
        particle.y += particle.velocity.y
        particle.life--

        if (particle.life <= 0) {
          particlesRef.current.splice(index, 1)
        } else {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.globalAlpha = particle.life / 100
          ctx.fill()
          ctx.globalAlpha = 1
        }
      })

      if (showParticles && particlesRef.current.length < 100) {
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * canvas.width
          const y = Math.random() * canvas.height
          const color = COLORS[Math.floor(Math.random() * COLORS.length)]
          particlesRef.current.push(createParticle(x, y, color))
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [showParticles])

  return (
    <div className="relative flex items-center justify-center h-16 w-16">
      <motion.canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: showParticles ? 1 : 0 }}
        transition={{ duration: 1 }}
      />
      <AnimatePresence>
        {showLock && (
          <motion.div
            className="relative z-10"
            initial={{ scale: 1, opacity: 1, rotate: 0 }}
            animate={{ 
              scale: isLocked ? 1 : [1, 1.5, 1.5],
              rotate: isLocked ? 0 : 360,
              opacity: 1
            }}
            exit={{ scale: 0, opacity: 0, rotate: 720 }}
            transition={{ 
              duration: 1.5,
              scale: { times: [0, 0.5, 1], ease: "easeInOut" },
              rotate: { duration: 1.5, ease: "easeInOut" },
              opacity: { duration: 0.5, delay: 2.5 }
            }}
          >
            <div 
              className="absolute rounded-full bg-[#878d94]" 
              style={{ 
                width: '52px',
                height: '52px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }} 
            />
            
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isLocked ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                <Image
                  src="https://res.cloudinary.com/drkudvyog/image/upload/v1734127851/Locked_icon_nhftkr.png"
                  alt="Locked"
                  width={38}
                  height={38}
                  className="relative z-20"
                  style={{ filter: 'drop-shadow(0px 0px 1px rgba(0,0,0,0.2))' }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isLocked ? 0 : 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
            >
              <Image
                src="https://res.cloudinary.com/drkudvyog/image/upload/v1734127851/Unlock_icon_cc0usb.png"
                alt="Unlocked"
                width={38}
                height={38}
                className="z-20"
                style={{ filter: 'drop-shadow(0px 0px 1px rgba(0,0,0,0.2))' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}