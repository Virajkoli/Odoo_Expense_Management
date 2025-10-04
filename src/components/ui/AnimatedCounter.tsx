'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
}

const AnimatedCounter = React.memo(({ value, duration = 2, suffix = '', prefix = '' }: AnimatedCounterProps) => {
  const counterRef = useRef<HTMLSpanElement>(null)

  const animationConfig = useMemo(() => ({
    duration,
    ease: 'power2.out'
  }), [duration])

  useEffect(() => {
    if (!counterRef.current) return

    const counter = { value: 0 }
    
    const animation = gsap.to(counter, {
      value: value,
      ...animationConfig,
      onUpdate: function() {
        if (counterRef.current) {
          counterRef.current.textContent = `${prefix}${Math.round(counter.value).toLocaleString()}${suffix}`
        }
      }
    })

    return () => {
      animation.kill()
    }
  }, [value, animationConfig, suffix, prefix])

  return (
    <span ref={counterRef} className="text-2xl font-bold text-gray-900">
      {prefix}0{suffix}
    </span>
  )
})

AnimatedCounter.displayName = 'AnimatedCounter'

export default AnimatedCounter