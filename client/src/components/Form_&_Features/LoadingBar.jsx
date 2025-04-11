import React from 'react'

const LoadingBar = ({ loading }) => {
  return (
    loading && (
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-purple-500 via-emerald-500 to-cyan-500 animate-loadbar rounded-full" />
      </div>
    )
  )
}

export default LoadingBar
