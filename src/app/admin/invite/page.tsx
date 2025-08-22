'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Key, Shield, Plus, Clock, CheckCircle, AlertCircle, History, RefreshCw, TrendingUp, Search, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface InviteCodeStats {
  total: number
  active: number
  used: number
  expired: number
}

interface InviteCodeHistory {
  id: string
  code: string
  isUsed: boolean
  usedBy: string | null
  usedByEmail: string | null
  usedAt: string | null
  expiresAt: string | null
  createdAt: string
  isExpired: boolean
}

export default function InviteAdminPage() {
  const [inviteKey, setInviteKey] = useState('')
  const [expiryHours, setExpiryHours] = useState(24)
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState<InviteCodeStats>({ total: 0, active: 0, used: 0, expired: 0 })
  const [history, setHistory] = useState<InviteCodeHistory[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [currentView, setCurrentView] = useState<'generator' | 'history'>('generator')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'used' | 'expired'>('all')

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return
    
    setIsLoadingStats(true)
    try {
      const response = await fetch('/api/admin/invite/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteKey })
      })

      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setHistory(data.recentCodes)
      } else {
        toast.error('Failed to fetch statistics')
      }
    } catch (_error) {
      toast.error('Failed to fetch statistics')
    } finally {
      setIsLoadingStats(false)
    }
  }, [isAuthenticated, inviteKey])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
    }
  }, [isAuthenticated, fetchStats])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (code: InviteCodeHistory) => {
    if (code.isUsed) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Used</span>
    } else if (code.isExpired) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">Expired</span>
    } else {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">Active</span>
    }
  }

  const filteredHistory = history.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.usedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.usedByEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'used' && code.isUsed) ||
                         (filterStatus === 'expired' && code.isExpired) ||
                         (filterStatus === 'active' && !code.isUsed && !code.isExpired)
    
    return matchesSearch && matchesFilter
  })

  const handleViewChange = (newView: 'generator' | 'history') => {
    if (newView === currentView || isTransitioning) return
    
    setIsTransitioning(true)
    
    // Start fade out
    setTimeout(() => {
      setCurrentView(newView)
      // Start fade in after view change
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 150)
  }

  const handleAuth = async () => {
    try {
      const response = await fetch('/api/admin/invite/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteKey })
      })

      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(true)
        toast.success('Access granted!')
      } else {
        toast.error('Invalid invite key')
      }
  } catch (_error) {
      toast.error('Authentication failed')
    }
  }

  const generateCode = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/invite/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inviteKey,
          expiryHours: expiryHours > 0 ? expiryHours : null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setGeneratedCode(data.code)
        toast.success('Invite code generated!')
        // Refresh stats after generating new code
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to generate code')
      }
  } catch (_error) {
      toast.error('Failed to generate invite code')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    toast.success('Code copied to clipboard!')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Access</h1>
              <p className="text-blue-200 mt-2">Secure invite code management portal</p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="p-8 bg-slate-800/90 border-blue-500/20 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="inviteKey" className="text-slate-300 font-medium flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  Master Access Key
                </Label>
                <Input
                  id="inviteKey"
                  type="password"
                  value={inviteKey}
                  onChange={(e) => setInviteKey(e.target.value)}
                  placeholder="Enter your master key"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                />
              </div>
              
              <Button
                onClick={handleAuth}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02]"
                disabled={!inviteKey.trim()}
              >
                <Shield className="w-4 h-4 mr-2" />
                Access Admin Panel
              </Button>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-blue-300/70 text-sm">
              Protected administrative interface
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-4">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `
      }} />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/20">
              <Key className="w-12 h-12 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-3">Invite Management</h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-full p-2 border border-blue-500/20">
            <div className="flex space-x-2">
              <Button
                onClick={() => handleViewChange('generator')}
                className={currentView === 'generator' ? 'bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 transition-all duration-200' : 'text-blue-200 hover:text-white hover:bg-blue-600/20 rounded-full px-6 py-2 transition-all duration-200'}
                variant={currentView === 'generator' ? 'default' : 'ghost'}
                disabled={isTransitioning}
              >
                Generator
              </Button>
              <Button
                onClick={() => handleViewChange('history')}
                variant={currentView === 'history' ? 'default' : 'ghost'}
                className={currentView === 'history' ? 'bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 transition-all duration-200' : 'text-blue-200 hover:text-white hover:bg-blue-600/20 rounded-full px-6 py-2 transition-all duration-200'}
                disabled={isTransitioning}
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-slate-800/60 border-blue-500/20 backdrop-blur-xl shadow-lg hover:shadow-blue-500/10 transition-all group">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Codes</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-slate-800/60 border-blue-500/20 backdrop-blur-xl shadow-lg hover:shadow-blue-500/10 transition-all group">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-blue-200 text-sm font-medium">Active Codes</p>
                <p className="text-3xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-slate-800/60 border-blue-500/20 backdrop-blur-xl shadow-lg hover:shadow-blue-500/10 transition-all group">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-blue-200 text-sm font-medium">Used Codes</p>
                <p className="text-3xl font-bold text-white">{stats.used}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-slate-800/60 border-blue-500/20 backdrop-blur-xl shadow-lg hover:shadow-blue-500/10 transition-all group">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-blue-200 text-sm font-medium">Expired Codes</p>
                <p className="text-3xl font-bold text-white">{stats.expired}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform translate-y-4 scale-95' : 'opacity-100 transform translate-y-0 scale-100'}`}>
          {currentView === 'generator' ? (
            <>
              {/* Main Generator Card */}
              <Card className="p-10 bg-slate-800/60 border-blue-500/20 backdrop-blur-xl shadow-2xl">
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-3">Generate New Invite Code</h2>
                    <p className="text-blue-200 text-lg">Create secure codes for user registration</p>
                  </div>
                  
                  <div className="max-w-lg mx-auto space-y-8">
                    <div className="space-y-3">
                      <p className="text-sm text-blue-300/70">Set to 0 for no expiration (max: 8760 hours)</p>
                      <Label htmlFor="expiry" className="text-blue-200 font-medium flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Expiry Time (hours)
                      </Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="expiry"
                          type="number"
                          value={expiryHours}
                          onChange={(e) => setExpiryHours(parseInt(e.target.value) || 0)}
                          placeholder="24"
                          min="0"
                          max="8760"
                          className="flex-1 bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg py-3"
                        />
                        <Button
                          onClick={generateCode}
                          disabled={isGenerating}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 text-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] disabled:transform-none"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          {isGenerating ? 'Generating...' : 'Generate'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {generatedCode && (
                    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
                      <div className="p-6 bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/40 rounded-2xl backdrop-blur-sm">
                        <div className="text-center mb-4">
                          <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <h3 className="text-lg font-bold text-blue-300">Code Generated Successfully!</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-semibold text-blue-300 block mb-2">
                              Generated Invite Code
                            </Label>
                            <div className="flex items-center gap-3">
                              <Input
                                value={generatedCode}
                                readOnly
                                className="flex-1 font-mono text-lg bg-slate-700/50 border-blue-500/50 text-blue-300 text-center tracking-widest py-3"
                              />
                              <Button
                                onClick={copyCode}
                                variant="outline"
                                className="border-blue-500/50 text-blue-300 hover:bg-blue-600/20 hover:border-blue-400 transition-all px-4 py-3"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-slate-800/60 rounded-lg p-4 border border-blue-500/20">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-blue-300 font-medium">Expires:</span>
                                <span className="text-blue-200 ml-2">
                                  {expiryHours > 0 ? `${expiryHours} hours` : 'Never'}
                                </span>
                              </div>
                              <div>
                                <span className="text-blue-300 font-medium">Usage:</span>
                                <span className="text-blue-200 ml-2">Single use only</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Search and Filter */}
              <Card className="p-6 bg-slate-800/60 border-blue-500/20 backdrop-blur-xl shadow-lg">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                      <Input
                        placeholder="Search by code, username, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setFilterStatus('all')}
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      className={filterStatus === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-500/30 text-blue-300 hover:bg-blue-600/20'}
                    >
                      All
                    </Button>
                    <Button
                      onClick={() => setFilterStatus('active')}
                      variant={filterStatus === 'active' ? 'default' : 'outline'}
                      className={filterStatus === 'active' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-500/30 text-blue-300 hover:bg-blue-600/20'}
                    >
                      Active
                    </Button>
                    <Button
                      onClick={() => setFilterStatus('used')}
                      variant={filterStatus === 'used' ? 'default' : 'outline'}
                      className={filterStatus === 'used' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-500/30 text-blue-300 hover:bg-blue-600/20'}
                    >
                      Used
                    </Button>
                    <Button
                      onClick={() => setFilterStatus('expired')}
                      variant={filterStatus === 'expired' ? 'default' : 'outline'}
                      className={filterStatus === 'expired' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-500/30 text-blue-300 hover:bg-blue-600/20'}
                    >
                      Expired
                    </Button>
                  </div>
                  <Button
                    onClick={fetchStats}
                    disabled={isLoadingStats}
                    variant="outline"
                    className="border-blue-500/30 text-blue-300 hover:bg-blue-600/20 hover:border-blue-400 transition-all"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </Card>

              {/* History Table */}
              <Card className="p-8 bg-slate-800/60 border-blue-500/20 backdrop-blur-xl shadow-2xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Detailed History</h2>
                  <p className="text-blue-200">Showing {filteredHistory.length} of {history.length} invite codes</p>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <Eye className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">No invite codes found</p>
                    <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-blue-500/20">
                          <th className="text-left py-4 px-4 text-blue-200 font-semibold">Code</th>
                          <th className="text-left py-4 px-4 text-blue-200 font-semibold">Status</th>
                          <th className="text-left py-4 px-4 text-blue-200 font-semibold">Used By</th>
                          <th className="text-left py-4 px-4 text-blue-200 font-semibold">Used At</th>
                          <th className="text-left py-4 px-4 text-blue-200 font-semibold">Expires At</th>
                          <th className="text-left py-4 px-4 text-blue-200 font-semibold">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.map((code, index) => (
                          <tr 
                            key={code.id} 
                            className={`border-b border-slate-700/30 hover:bg-blue-600/5 transition-colors ${
                              index % 2 === 0 ? 'bg-slate-700/10' : ''
                            }`}
                            style={{
                              animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                            }}
                          >
                            <td className="py-4 px-4">
                              <span className="font-mono text-sm bg-slate-700/60 px-3 py-2 rounded-lg text-blue-300 border border-blue-500/20">
                                {code.code}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(code)}
                            </td>
                            <td className="py-4 px-4 text-slate-300">
                              {code.usedBy ? (
                                <div>
                                  <div className="text-blue-200 font-medium">{code.usedBy}</div>
                                  <div className="text-xs text-slate-400">{code.usedByEmail}</div>
                                </div>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-400 text-sm">
                              {formatDate(code.usedAt)}
                            </td>
                            <td className="py-4 px-4 text-slate-400 text-sm">
                              {code.expiresAt ? formatDate(code.expiresAt) : 
                                <span className="text-blue-300">Never</span>
                              }
                            </td>
                            <td className="py-4 px-4 text-slate-400 text-sm">
                              {formatDate(code.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
