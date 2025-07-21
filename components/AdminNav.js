import Link from 'next/link'
import { Settings, ChefHat } from 'lucide-react'

export default function AdminNav() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Link href="/admin">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/30 hover:bg-white transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Admin</span>
          </div>
        </div>
      </Link>
    </div>
  )
} 