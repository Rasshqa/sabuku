"use client";

import React, { useState } from 'react';
import { 
  Search, Moon, Bell, BookOpen, Users, User, Video, Calendar, 
  CreditCard, FileText, Bookmark, Heart, Menu, X, ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: BookOpen, label: 'Home', active: false },
    { icon: Users, label: 'Students', active: false },
    { icon: User, label: 'Teachers', active: false },
    { icon: BookOpen, label: 'Courses', active: false },
    { icon: Video, label: 'Live Class', active: false },
    { icon: Calendar, label: 'Attendance', active: false },
    { icon: CreditCard, label: 'Payments', active: false },
    { icon: BookOpen, label: 'Library', active: true },
    { icon: FileText, label: 'Reports', active: false },
  ];

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:shadow-none lg:relative lg:flex lg:flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6161FF] rounded-lg flex items-center justify-center">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-800">SkillSet</span>
          </div>
          <button className="lg:hidden text-gray-500" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto hide-scrollbar">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href="#"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  item.active 
                    ? 'text-[#6161FF] bg-[#F4F4FF] font-semibold' 
                    : 'text-gray-500 hover:text-[#6161FF] hover:bg-gray-50 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'text-[#6161FF]' : 'text-gray-400'}`} />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Upgrade Box */}
        <div className="p-5 m-4 bg-gradient-to-b from-white to-[#F8F9FE] border border-gray-100 rounded-3xl shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#6161FF]/5 rounded-bl-full" />
          <p className="text-sm text-gray-500 font-medium mb-4 relative z-10">
            Upgrade to <span className="text-[#6161FF] font-bold">Pro</span> for<br/>more facilities
          </p>
          <button className="w-full py-3 px-4 bg-gradient-to-r from-[#7B61FF] to-[#6161FF] hover:from-[#6B51EF] hover:to-[#5151EF] text-white rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 relative z-10">
            Upgrade <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 px-6 lg:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden text-gray-500 hover:text-gray-700 bg-white p-2 rounded-xl shadow-sm"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-sm hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search.." 
                className="w-full pl-11 pr-4 py-2.5 bg-white border-none rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full animate-pulse"></span>
              Live
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 hover:text-gray-600 transition-colors">
              <Moon className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#FF6B6B] rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-[#FFD1C1] overflow-hidden flex items-center justify-center ml-2 border-2 border-white shadow-sm">
               <User className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 pt-2">
          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* Left/Main Column */}
            <div className="flex-1 flex flex-col gap-8 min-w-0">
              {/* Banner */}
              <div className="relative bg-gradient-to-r from-[#7B61FF] to-[#6198FF] rounded-[32px] p-8 md:p-10 overflow-hidden shadow-xl shadow-indigo-200/50">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                <div className="absolute top-8 left-1/4 w-2 h-2 bg-yellow-300 rounded-full"></div>
                <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-pink-300 rounded-full"></div>
                <div className="absolute bottom-8 right-1/3 w-2 h-2 bg-white rounded-full"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between h-full">
                  <div className="text-center md:text-center flex-1 max-w-xl mx-auto md:ml-12 lg:ml-24">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      Hi, Irham Muhammad Shidiq
                    </h2>
                    <p className="text-indigo-50 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
                      The library serves as a welcoming home for knowledge seekers and avid readers alike
                    </p>
                    <button className="px-8 py-2.5 bg-transparent border border-white/40 text-white rounded-full hover:bg-white/10 transition-colors text-sm font-semibold">
                      Learn more
                    </button>
                  </div>
                </div>
              </div>

              {/* Popular Section */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-800">Popular</h3>
                  <button className="text-[11px] font-bold text-gray-400 hover:text-[#6161FF] transition-colors uppercase tracking-widest">View All</button>
                </div>
                <div className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar snap-x">
                  {[
                    { bg: 'bg-[#E3F2FD]', icon: 'text-[#64B5F6]' },
                    { bg: 'bg-[#FFF3E0]', icon: 'text-[#FFB74D]' },
                    { bg: 'bg-[#F3E5F5]', icon: 'text-[#BA68C8]' },
                    { bg: 'bg-[#FFEBEE]', icon: 'text-[#E57373]' },
                  ].map((color, i) => (
                    <div key={i} className="min-w-[220px] md:min-w-[240px] bg-white p-3.5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] snap-start flex-1 group cursor-pointer hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                      <div className={`aspect-[4/3] ${color.bg} rounded-[20px] mb-4 relative overflow-hidden flex items-center justify-center transform group-hover:scale-[1.02] transition-transform duration-300`}>
                        <BookOpen className={`w-14 h-14 ${color.icon} opacity-60 group-hover:scale-110 transition-transform duration-500`} />
                        <button className="absolute bottom-3 left-3 w-7 h-7 bg-white/50 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-white/80 transition-colors">
                          <Bookmark className="w-3.5 h-3.5 text-white fill-white" />
                        </button>
                        <button className="absolute bottom-3 right-3 w-7 h-7 bg-white/50 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-white/80 transition-colors">
                          <Heart className="w-3.5 h-3.5 text-white fill-white" />
                        </button>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm mb-1.5 px-1 truncate">The book is an essent...</h4>
                      <p className="text-[11px] text-gray-400 px-1 truncate">This is just a general example...</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Ongoing Section */}
              <section className="pb-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-800">Ongoing</h3>
                  <button className="text-[11px] font-bold text-gray-400 hover:text-[#6161FF] transition-colors uppercase tracking-widest">View All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {[
                    { bg: 'bg-[#EDE7F6]', icon: 'text-[#9575CD]' },
                    { bg: 'bg-[#E0F7FA]', icon: 'text-[#4DD0E1]' },
                    { bg: 'bg-[#FCE4EC]', icon: 'text-[#F06292]' },
                    { bg: 'bg-[#E8EAF6]', icon: 'text-[#7986CB]' },
                  ].map((color, i) => (
                    <div key={i} className="bg-white p-3.5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] group cursor-pointer hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                      <div className={`aspect-[4/3] ${color.bg} rounded-[20px] mb-4 relative overflow-hidden flex items-center justify-center transform group-hover:scale-[1.02] transition-transform duration-300`}>
                        <BookOpen className={`w-14 h-14 ${color.icon} opacity-60 group-hover:scale-110 transition-transform duration-500`} />
                         <button className="absolute bottom-3 left-3 w-7 h-7 bg-white/50 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-white/80 transition-colors">
                          <Bookmark className="w-3.5 h-3.5 text-white fill-white" />
                        </button>
                        <button className="absolute bottom-3 right-3 w-7 h-7 bg-white/50 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-white/80 transition-colors">
                          <Heart className="w-3.5 h-3.5 text-white fill-white" />
                        </button>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm mb-1.5 px-1 truncate">The book is an essent...</h4>
                      <p className="text-[11px] text-gray-400 px-1 truncate">This is just a general example...</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column / Panel */}
            <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
              
              {/* Achievement */}
              <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">Unlocks achievement</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Goal achieved success unlocked.</p>
                  </div>
                  <div className="w-10 h-6 bg-[#6161FF] rounded-full flex items-center p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full transform translate-x-4 shadow-sm"></div>
                  </div>
                </div>
                
                <div className="mt-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center shrink-0">
                       <User className="w-5 h-5 text-[#64B5F6]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="font-bold text-gray-800">66% Achieved</span>
                        <span className="text-gray-400 font-medium">7 Days left</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#64B5F6] rounded-full w-[66%]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3E0] flex items-center justify-center shrink-0">
                       <User className="w-5 h-5 text-[#FFB74D]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="font-bold text-gray-800">33% Achieved</span>
                        <span className="text-gray-400 font-medium">12 Days left</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFB74D] rounded-full w-[33%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Sales */}
              <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800 text-sm">Best sales</h3>
                  <button className="text-[11px] font-bold text-gray-400 hover:text-[#6161FF] uppercase tracking-widest">View All</button>
                </div>
                
                <div className="space-y-4">
                  {[
                    { title: 'Grow green', rating: '4.5', color: 'bg-[#FFEBEE]', text: 'text-[#E57373]' },
                    { title: 'Raise a plant', rating: '4.0', color: 'bg-[#EDE7F6]', text: 'text-[#9575CD]' },
                    { title: 'One questin...', rating: '4.5', color: 'bg-[#E3F2FD]', text: 'text-[#64B5F6]' },
                    { title: 'Unplug day', rating: '4.0', color: 'bg-[#FCE4EC]', text: 'text-[#F06292]' },
                    { title: 'Best year', rating: '3.5', color: 'bg-[#FFF3E0]', text: 'text-[#FFB74D]' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 group hover:bg-gray-50/50 p-2 -mx-2 rounded-[16px] transition-colors duration-300">
                      <div className={`w-11 h-11 ${item.color} rounded-[14px] flex items-center justify-center shrink-0 transform group-hover:rotate-3 transition-transform duration-300`}>
                        <BookOpen className={`w-5 h-5 ${item.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="text-[11px] text-gray-500 font-semibold">{item.rating}</span>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 bg-[#F4F4FF] text-[#6161FF] rounded-xl text-xs font-bold hover:bg-[#6161FF] hover:text-white transition-colors duration-300 shadow-sm hover:shadow-md">
                        Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      
      {/* Hide scrollbar styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
