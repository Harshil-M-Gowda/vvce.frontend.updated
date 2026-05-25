// src/components/ui/index.jsx
// All shared UI primitives in one file

export function StatCard({ label, value, sub, color = 'gold', icon }) {
  const colors = {
    gold: 'text-gold', teal: 'text-teal-brand', navy: 'text-navy', red: 'text-red-500'
  }
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className={`font-syne font-extrabold text-3xl ${colors[color]}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-syne font-bold text-base text-navy">{title}</h2>
      {action}
    </div>
  )
}

export function Button({ children, variant = 'gold', size = 'md', className = '', ...props }) {
  const sizes = { sm: 'px-3.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = {
    gold: 'btn-gold',
    outline: 'btn-outline',
    ghost: 'bg-transparent border border-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100',
    success: 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  }
  return (
    <button
      className={`font-syne font-semibold rounded-lg inline-flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Badge({ status, children }) {
  return <span className={`badge badge-${status}`}>{children}</span>
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <input className={`input ${error ? 'border-red-400' : ''}`} {...props} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select className={`input ${error ? 'border-red-400' : ''}`} {...props}>{children}</select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <textarea className={`input resize-y min-h-[80px] ${error ? 'border-red-400' : ''}`} {...props} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto shadow-2xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-syne font-bold text-lg text-navy">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function Spinner({ size = 20 }) {
  return (
    <div className="flex items-center justify-center py-10">
      <div style={{ width: size, height: size }}
        className="border-2 border-slate-200 border-t-gold rounded-full animate-spin" />
    </div>
  )
}

export function EmptyState({ icon = '📭', title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-syne font-bold text-navy mb-2">{title}</h3>
      {desc && <p className="text-slate-400 text-sm mb-4 max-w-xs">{desc}</p>}
      {action}
    </div>
  )
}

export function Table({ columns, data, loading }) {
  if (loading) return <Spinner />
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {columns.map(c => (
              <th key={c.key} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.length === 0
            ? <tr><td colSpan={columns.length} className="text-center text-slate-400 text-sm py-10">No records found</td></tr>
            : data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                {columns.map(c => (
                  <td key={c.key} className="px-4 py-3.5 text-[13px] text-slate-700">
                    {c.render ? c.render(row[c.key], row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-5 w-fit">
      {tabs.map(t => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-4 py-1.5 rounded-md text-sm font-syne font-semibold transition-all ${
            active === t.value ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'
          }`}
        >
          {t.label}
          {t.count != null && (
            <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${active === t.value ? 'bg-gold/20 text-gold' : 'bg-slate-200 text-slate-500'}`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
