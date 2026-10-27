import { Search, X } from 'lucide-react';

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export const AdminSearchInput = ({ value, onChange, placeholder, className = '' }: AdminSearchInputProps) => (
  <div className={`relative w-full min-w-0 max-w-xl flex-1 ${className}`}>
    <Search size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-11 w-full rounded-xl border border-input bg-input-background py-2 pl-10 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Limpiar búsqueda"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X size={15} />
      </button>
    )}
  </div>
);

export const normalizeAdminSearch = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();

export const matchesAdminSearch = (entity: unknown, query: string) => {
  const normalizedQuery = normalizeAdminSearch(query);
  if (!normalizedQuery) return true;

  const collect = (value: unknown): string[] => {
    if (value === null || value === undefined) return [];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return [String(value)];
    if (Array.isArray(value)) return value.flatMap(collect);
    if (typeof value === 'object') return Object.values(value as Record<string, unknown>).flatMap(collect);
    return [];
  };

  return normalizeAdminSearch(collect(entity).join(' ')).includes(normalizedQuery);
};
