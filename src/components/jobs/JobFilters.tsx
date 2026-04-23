import { useUIStore } from '../../store/uiStore';
import {
  JOB_LEVEL_OPTIONS,
  JOB_LOCATION_OPTIONS,
  JOB_TOPIC_OPTIONS,
  JOB_TYPE_OPTIONS,
} from '../../utils/filters';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';

export function JobFilters() {
  const type = useUIStore((s) => s.jobTypeFilter);
  const level = useUIStore((s) => s.jobLevelFilter);
  const location = useUIStore((s) => s.jobLocationFilter);
  const topics = useUIStore((s) => s.jobTopicFilter);
  const query = useUIStore((s) => s.searchQuery);
  const setType = useUIStore((s) => s.setJobTypeFilter);
  const setLevel = useUIStore((s) => s.setJobLevelFilter);
  const setLocation = useUIStore((s) => s.setJobLocationFilter);
  const setTopics = useUIStore((s) => s.setJobTopicFilter);
  const setQuery = useUIStore((s) => s.setSearchQuery);
  const clearFilters = useUIStore((s) => s.clearFilters);

  const toggleTopic = (topic: string) => {
    if (topics.includes(topic)) {
      setTopics(topics.filter((t) => t !== topic));
    } else {
      setTopics([...topics, topic]);
    }
  };

  const hasActiveFilters =
    type !== 'all' ||
    level !== 'all' ||
    location !== 'all' ||
    topics.length > 0 ||
    query.length > 0;

  return (
    <div
      role="region"
      aria-label="Job filters"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }} role="group" aria-label="Topic filter">
        {JOB_TOPIC_OPTIONS.map((topic) => {
          const pressed = topics.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              aria-pressed={pressed}
              onClick={() => toggleTopic(topic)}
              style={pillStyle(pressed)}
            >
              {topic}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <SegmentedGroup
          label="Type filter"
          options={JOB_TYPE_OPTIONS}
          value={type}
          onChange={setType}
        />
        <SegmentedGroup
          label="Level filter"
          options={JOB_LEVEL_OPTIONS}
          value={level}
          onChange={setLevel}
        />
        <SegmentedGroup
          label="Location filter"
          options={JOB_LOCATION_OPTIONS}
          value={location}
          onChange={setLocation}
        />

        <div style={{ flex: 1, minWidth: '200px' }}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search title or company"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

interface SegmentedGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function SegmentedGroup<T extends string>({ label, options, value, onChange }: SegmentedGroupProps<T>) {
  return (
    <div role="group" aria-label={label} style={{ display: 'flex', gap: '4px' }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            style={pillStyle(active)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border-mid)'}`,
    background: active ? 'var(--accent-dim)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };
}
