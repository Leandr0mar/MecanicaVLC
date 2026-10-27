import { ChevronDown } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { PAISES_CODIGO } from '../../utils/phoneCountries';

interface CountryCodeSelectProps {
  value: string;
  registration: UseFormRegisterReturn;
  className?: string;
}

export const CountryCodeSelect = ({ value, registration, className = '' }: CountryCodeSelectProps) => {
  const paisActual = PAISES_CODIGO.find(([, , codigo]) => codigo === value) ?? PAISES_CODIGO[0];

  return (
    <div className={`relative h-full shrink-0 border-r border-input bg-muted/40 ${className}`}>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 px-2 text-sm text-foreground">
        <span>{paisActual[2]}</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </span>
      <select
        aria-label="Código de país"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        {...registration}
      >
        {PAISES_CODIGO.map(([bandera, pais, codigo]) => (
          <option key={`${pais}-${codigo}`} value={codigo}>
            {bandera} {pais} ({codigo})
          </option>
        ))}
      </select>
    </div>
  );
};
