interface TabBarProps {
  tabs: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TabBar({ tabs, value, onChange, className = "" }: TabBarProps) {
  return (
    <div className={`flex border border-gray-200 rounded-xl p-1 bg-gray-50 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`flex-1 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            value === tab.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
