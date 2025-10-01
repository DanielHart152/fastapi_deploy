"use client"

import { Button } from "@/components/ui/button"
import { Video, Menu, X, User, LogOut, Users } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

function AuthButtons() {
  const { user, logout } = useAuth()

  if (user) {
    return (
      <div className="hidden md:flex items-center space-x-4">
        {/* <Link href="/dashboard_v0">
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            Dashboard
          </Button>
        </Link> */}
        <Link href="/dashboard_v0">
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            Dashboard
          </Button>
        </Link>
        <Link href="/meetings">
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            My Meetings
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <User className="w-4 h-4 mr-2" />
              {user.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card border-white/20">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="text-white hover:bg-white/10 cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            {(user?.role === 'manager' || user?.role === 'admin') && (
              <DropdownMenuItem asChild>
                <Link href="/users" className="text-white hover:bg-white/10 cursor-pointer">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={logout} className="text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="hidden md:flex items-center space-x-4">
      <Link href="/auth/login">
        <Button variant="ghost" className="text-gray-300 hover:text-white">
          Login
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
          Sign Up
        </Button>
      </Link>
    </div>
  )
}

function MobileAuthButtons() {
  const { user, logout } = useAuth()

  if (user) {
    return (
      <>
        {/* <Link href="/dashboard_v0">
          <Button variant="ghost" className="text-gray-300 hover:text-white justify-start w-full">
            Dashboard
          </Button>
        </Link> */}
        <Link href="/dashboard_v0">
          <Button variant="ghost" className="text-gray-300 hover:text-white justify-start w-full">
            Dashboard
          </Button>
        </Link>
        <Link href="/meetings">
          <Button variant="ghost" className="text-gray-300 hover:text-white justify-start w-full">
            My Meetings
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="text-gray-300 hover:text-white justify-start w-full"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </>
    )
  }

  return (
    <>
      <Link href="/auth/login">
        <Button variant="ghost" className="text-gray-300 hover:text-white justify-start w-full">
          Login
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 justify-start w-full">
          Sign Up
        </Button>
      </Link>
    </>
  )
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MeetFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">
              About
            </a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <AuthButtons />

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                <MobileAuthButtons />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
