import React, { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  Briefcase,
  AlertCircle
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import StatusBadge from '../ui/StatusBadge'
import { targetCompanies } from '../../data/companies'

const STATUS_OPTIONS = ['Not Applied', 'Applied', 'Interviewing', 'Offer', 'Rejected']

// Safely get local storage
function getLocalStatus() {
  try {
    const data = localStorage.getItem('nexus_company_status')
    return data ? JSON.parse(data) : {}
  } catch (e) {
    return {}
  }
}

function setLocalStatus(company, status) {
  try {
    const data = getLocalStatus()
    data[company] = status
    localStorage.setItem('nexus_company_status', JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save status', e)
  }
}

export default function TargetCompanies() {
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [platformFilter, setPlatformFilter] = useState('All')
  
  const [sortConfig, setSortConfig] = useState({ key: 'chancePercent', direction: 'desc' })
  const [expandedRows, setExpandedRows] = useState({})
  const [statuses, setStatuses] = useState({})

  // Load statuses on mount
  useEffect(() => {
    setStatuses(getLocalStatus())
  }, [])

  const handleStatusChange = (company, newStatus) => {
    setStatuses(prev => {
      const next = { ...prev, [company]: newStatus }
      setLocalStatus(company, newStatus)
      return next
    })
  }

  const toggleExpand = (company) => {
    setExpandedRows(prev => ({
      ...prev,
      [company]: !prev[company]
    }))
  }

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'desc' } // default new sort to desc
    })
  }

  // Derived filters
  const platforms = useMemo(() => ['All', ...new Set(targetCompanies.map(c => c.platform).filter(Boolean))], [])

  const filteredAndSorted = useMemo(() => {
    let result = [...targetCompanies]

    // Filters
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.company.toLowerCase().includes(q))
    }
    if (priorityFilter !== 'All') {
      result = result.filter(c => c.priority === priorityFilter)
    }
    if (platformFilter !== 'All') {
      result = result.filter(c => c.platform === platformFilter)
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      if (sortConfig.key === 'salary') {
        // basic sort by taking the first number in the salary string e.g., "16-28 LPA" -> 16
        aVal = parseInt((aVal || '0').match(/\d+/)?.[0] || '0', 10)
        bVal = parseInt((bVal || '0').match(/\d+/)?.[0] || '0', 10)
      } else if (sortConfig.key === 'company') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [search, priorityFilter, platformFilter, sortConfig])

  // Stats
  const stats = useMemo(() => {
    const total = targetCompanies.length
    const byStatus = {
      'Not Applied': 0,
      'Applied': 0,
      'Interviewing': 0,
      'Offer': 0,
      'Rejected': 0
    }
    targetCompanies.forEach(c => {
      const s = statuses[c.company] || 'Not Applied'
      byStatus[s] = (byStatus[s] || 0) + 1
    })
    
    const byPriority = {
      'High': targetCompanies.filter(c => c.priority === 'High').length,
      'Medium': targetCompanies.filter(c => c.priority === 'Medium').length,
      'Low': targetCompanies.filter(c => c.priority === 'Low').length,
    }

    return { total, byStatus, byPriority }
  }, [statuses])

  const getChanceColor = (percent) => {
    if (percent >= 80) return 'var(--accent-green)'
    if (percent >= 65) return 'var(--accent-gold)'
    if (percent >= 50) return '#f97316' // orange
    return 'var(--text-dim)' // red/gray
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span className="ml-1 opacity-20">↕</span>
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1 inline" /> : <ChevronDown size={14} className="ml-1 inline" />
  }

  return (
    <div className="section-in mt-8 space-y-4">
      {/* Header and Stats */}
      <GlassCard className="p-5">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[var(--text-primary)]">
              <Target size={20} className="text-[var(--accent-cyan)]" /> Target Companies
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Your 100-company hit list. Progress is saved locally on this device only.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <StatusBadge variant="neutral">Total: {stats.total}</StatusBadge>
            <StatusBadge variant="gold">High Priority: {stats.byPriority.High}</StatusBadge>
            <StatusBadge variant="active">Applied: {stats.byStatus.Applied + stats.byStatus.Interviewing}</StatusBadge>
            <StatusBadge variant="complete">Offers: {stats.byStatus.Offer}</StatusBadge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-white/5 py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-dim)] focus:border-[var(--accent-cyan)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--text-secondary)]" />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-[var(--border-subtle)] bg-[#050c18] py-2 pl-2 pr-6 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value)}
              className="rounded-lg border border-[var(--border-subtle)] bg-[#050c18] py-2 pl-2 pr-6 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]"
            >
              {platforms.map(p => <option key={p} value={p}>{p === 'All' ? 'All Platforms' : p}</option>)}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Table (Desktop) / Cards (Mobile) */}
      <GlassCard className="overflow-hidden">
        {/* Mobile View (Cards) */}
        <div className="block md:hidden">
          {filteredAndSorted.map(company => (
            <div 
              key={company.company} 
              className="border-b border-[var(--border-subtle)] p-4 last:border-0"
              style={{ borderLeft: `3px solid ${getChanceColor(company.chancePercent)}` }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[var(--text-dim)]">#{company.rank}</span>
                    <h3 className="font-bold text-[var(--text-primary)]">{company.company}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{company.role}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold" style={{ color: getChanceColor(company.chancePercent) }}>
                    {company.chancePercent}%
                  </div>
                  <StatusBadge variant={company.priority === 'High' ? 'gold' : company.priority === 'Medium' ? 'neutral' : 'locked'} className="mt-1 scale-90 origin-right">
                    {company.priority}
                  </StatusBadge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-[11px] text-[var(--text-dim)] mb-3">
                <span>📍 {company.location}</span>
                <span>💰 {company.salary || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  value={statuses[company.company] || 'Not Applied'}
                  onChange={e => handleStatusChange(company.company, e.target.value)}
                  className="rounded border border-[var(--border-subtle)] bg-[#0a1628] px-2 py-1 text-xs text-[var(--text-secondary)] outline-none"
                >
                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>

                <div className="flex items-center gap-2">
                  {company.jobUrl && (
                    <a href={company.jobUrl} target="_blank" rel="noreferrer" className="text-[var(--accent-cyan)] hover:text-white p-1">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button 
                    onClick={() => toggleExpand(company.company)}
                    className="text-[var(--text-secondary)] hover:text-white p-1"
                  >
                    {expandedRows[company.company] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  </button>
                </div>
              </div>

              {expandedRows[company.company] && (
                <div className="mt-3 rounded-md bg-white/5 p-3 text-xs leading-relaxed text-[var(--text-primary)]/80">
                  <p className="flex gap-2 font-semibold text-[var(--text-secondary)] mb-1">
                    <Briefcase size={12} className="mt-0.5" /> Why You Fit
                  </p>
                  {company.whyFit}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="cursor-pointer py-3 pl-4 pr-2 font-mono" onClick={() => handleSort('rank')}>
                  Rank <SortIcon columnKey="rank" />
                </th>
                <th className="cursor-pointer py-3 px-2" onClick={() => handleSort('company')}>
                  Company <SortIcon columnKey="company" />
                </th>
                <th className="cursor-pointer py-3 px-2" onClick={() => handleSort('chancePercent')}>
                  Match % <SortIcon columnKey="chancePercent" />
                </th>
                <th className="py-3 px-2">Role & Location</th>
                <th className="cursor-pointer py-3 px-2" onClick={() => handleSort('salary')}>
                  Salary <SortIcon columnKey="salary" />
                </th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredAndSorted.map(company => (
                <React.Fragment key={company.company}>
                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 pl-4 pr-2 font-mono text-xs text-[var(--text-dim)] relative">
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1" 
                        style={{ backgroundColor: getChanceColor(company.chancePercent), opacity: 0.8 }} 
                      />
                      #{company.rank}
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-semibold text-[var(--text-primary)]">{company.company}</div>
                      <div className="mt-0.5 flex gap-1">
                        <StatusBadge variant={company.priority === 'High' ? 'gold' : company.priority === 'Medium' ? 'neutral' : 'locked'} style={{ fontSize: '9px', padding: '1px 6px' }}>
                          {company.priority}
                        </StatusBadge>
                        {company.platform && (
                          <span className="text-[10px] text-[var(--text-dim)] px-1 rounded bg-white/5">{company.platform}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-mono font-bold" style={{ color: getChanceColor(company.chancePercent) }}>
                        {company.chancePercent}%
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-[var(--text-primary)]/90">{company.role}</div>
                      <div className="text-xs text-[var(--text-dim)] mt-0.5">📍 {company.location}</div>
                    </td>
                    <td className="py-3 px-2 text-[var(--text-secondary)] text-xs">
                      {company.salary || '-'}
                    </td>
                    <td className="py-3 px-2">
                      <select
                        value={statuses[company.company] || 'Not Applied'}
                        onChange={e => handleStatusChange(company.company, e.target.value)}
                        className="rounded border border-[var(--border-subtle)] bg-[#0a1628] px-2 py-1 text-xs text-[var(--text-secondary)] outline-none focus:border-[var(--accent-cyan)] transition-colors"
                      >
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-[var(--text-secondary)]">
                        {company.jobUrl && (
                          <a href={company.jobUrl} target="_blank" rel="noreferrer" className="hover:text-[var(--accent-cyan)] transition-colors" title="View Job">
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button 
                          onClick={() => toggleExpand(company.company)}
                          className={`hover:text-white transition-colors ${expandedRows[company.company] ? 'text-white' : ''}`}
                          title="Why You Fit"
                        >
                          {expandedRows[company.company] ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows[company.company] && (
                    <tr className="bg-white/[0.01]">
                      <td colSpan={7} className="py-3 pl-6 pr-4">
                        <div className="rounded-lg bg-white/5 p-4 text-sm leading-relaxed text-[var(--text-primary)]/80 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-cyan)] opacity-50" />
                          <div className="flex gap-2 items-start">
                            <AlertCircle size={16} className="text-[var(--accent-cyan)] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-[var(--text-secondary)] block mb-1">Why this fits your profile:</span>
                              {company.whyFit}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          {filteredAndSorted.length === 0 && (
            <div className="py-12 text-center text-[var(--text-secondary)]">
              No companies match your filters.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
