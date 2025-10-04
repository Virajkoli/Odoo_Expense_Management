'use client'

import React, { useEffect, useMemo } from 'react'
import { useGSAPAnimation } from '@/hooks/useGSAP'

interface LoadingSkeletonProps {
  type: 'card' | 'table' | 'chart'
  count?: number
}

const LoadingSkeleton = React.memo(({ type, count = 1 }: LoadingSkeletonProps) => {
  const skeletonRef = useGSAPAnimation()

  // Memoize arrays to prevent re-creation on each render
  const skeletonCards = useMemo(() => Array.from({ length: count }), [count])
  const tableRows = useMemo(() => Array.from({ length: 5 }), [])

  useEffect(() => {
    skeletonRef.pulseAnimation()
  }, [skeletonRef])

  const CardSkeleton = React.memo(() => (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2 skeleton"></div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2 skeleton"></div>
          <div className="h-3 bg-gray-200 rounded w-32 skeleton"></div>
        </div>
        <div className="w-16 h-16 bg-gray-200 rounded-xl skeleton"></div>
      </div>
    </div>
  ))

  const TableRowSkeleton = React.memo(() => (
    <div className="flex items-center space-x-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-24 skeleton"></div>
      <div className="h-4 bg-gray-200 rounded w-32 skeleton"></div>
      <div className="h-4 bg-gray-200 rounded w-20 skeleton"></div>
      <div className="h-6 bg-gray-200 rounded w-16 skeleton"></div>
    </div>
  ))

  CardSkeleton.displayName = 'CardSkeleton'
  TableRowSkeleton.displayName = 'TableRowSkeleton'

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {skeletonCards.map((_, index) => (
          <div
            key={index}
            ref={index === 0 ? skeletonRef.elementRef : undefined}
          >
            <CardSkeleton />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <div className="h-6 bg-gray-200 rounded w-48 skeleton"></div>
        </div>
        <div className="p-6">
          {tableRows.map((_, index) => (
            <TableRowSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (type === 'chart') {
    return (
      <div className="w-full h-80 p-4 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 skeleton"></div>
        <div className="h-64 bg-gray-200 rounded skeleton"></div>
      </div>
    )
  }

  return null
})

LoadingSkeleton.displayName = 'LoadingSkeleton'

export default LoadingSkeleton