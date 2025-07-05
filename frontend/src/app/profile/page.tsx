"use client";
import React from "react";
import useAuthStore from "@/lib/store/authStore";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will be handled by AuthGuard
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponibile';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 pb-20">
      {/* Header Profile */}
      <div className="mx-6 pt-6 pb-4">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
              <span className="text-2xl font-bold text-white">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-white text-xl font-semibold">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email?.split('@')[0] || 'Utente'
                }
              </h1>
              <p className="text-white/80 text-sm">{user?.email}</p>
              <p className="text-white/70 text-xs mt-1">
                <i className="fa-solid fa-calendar-days mr-1"></i>
                Membro dal {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="mx-6 space-y-4">
        
        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <i className="fa-solid fa-user text-red-500 text-lg"></i>
            <h2 className="text-red-800 font-semibold">Informazioni Personali</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Nome</span>
              <span className="text-gray-800 font-medium">
                {user?.firstName || 'Non impostato'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-100">
              <span className="text-gray-600">Cognome</span>
              <span className="text-gray-800 font-medium">
                {user?.lastName || 'Non impostato'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-100">
              <span className="text-gray-600">Email</span>
              <span className="text-gray-800 font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-100">
              <span className="text-gray-600">Tipo Account</span>
              <span className="text-gray-800 font-medium capitalize">
                {user?.provider || 'Standard'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <i className="fa-solid fa-chart-line text-red-500 text-lg"></i>
            <h2 className="text-red-800 font-semibold">Statistiche Ascolto</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-xs text-red-700">Libri Completati</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">0h</div>
              <div className="text-xs text-orange-700">Tempo Totale</div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <i className="fa-solid fa-gear text-red-500 text-lg"></i>
            <h2 className="text-red-800 font-semibold">Impostazioni</h2>
          </div>
          
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-bell text-gray-400"></i>
                <span className="text-gray-800">Notifiche</span>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
            </button>
            
            <button className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-volume-high text-gray-400"></i>
                <span className="text-gray-800">Qualità Audio</span>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
            </button>
            
            <button className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-download text-gray-400"></i>
                <span className="text-gray-800">Download Offline</span>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <i className="fa-solid fa-shield-halved text-red-500 text-lg"></i>
            <h2 className="text-red-800 font-semibold">Account</h2>
          </div>
          
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-lock text-gray-400"></i>
                <span className="text-gray-800">Cambia Password</span>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
            </button>
            
            <button className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-circle-info text-gray-400"></i>
                <span className="text-gray-800">Privacy e Sicurezza</span>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="font-medium">Esci dall'Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
