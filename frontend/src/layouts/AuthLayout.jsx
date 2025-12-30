import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>
    </div>
  )
}
