import type { PollutantCode } from '@/types';
import { POLLUTANT_CODES, POLLUTANT_COLOR } from '@/lib/pollutants';

interface Props {
  label: string;
  mode: 'single' | 'multi';
  value: PollutantCode | Set<PollutantCode>;
  onChange: (code: PollutantCode) => void;
}

export default function PollutantPicker({
  label,
  mode,
  value,
  onChange,
}: Props): JSX.Element {
  const isActive = (code: PollutantCode): boolean =>
    mode === 'single' ? value === code : (value as Set<PollutantCode>).has(code);

  return (
    <div className="pill-row" role="group" aria-label={label}>
      {POLLUTANT_CODES.map((code) => {
        const active = isActive(code);
        return (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            className={`pill pill-toggle${active ? ' is-active' : ''}`}
            style={active ? { borderColor: POLLUTANT_COLOR[code] } : undefined}
            aria-pressed={active}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
