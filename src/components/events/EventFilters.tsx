import { useUIStore } from '../../store/uiStore';
import {
  EVENT_DATE_OPTIONS,
  EVENT_FORMAT_OPTIONS,
  EVENT_TOPIC_OPTIONS,
} from '../../utils/filters';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';

export function EventFilters() {
  const topics = useUIStore((s) => s.eventTopicFilter);
  const date = useUIStore((s) => s.eventDateFilter);
  const format = useUIStore((s) => s.eventFormatFilter);
  const query = useUIStore((s) => s.searchQuery);
  const setTopics = useUIStore((s) => s.setEventTopicFilter);
  const setDate = useUIStore((s) => s.setEventDateFilter);
  const setFormat = useUIStore((s) => s.setEventFormatFilter);
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
    topics.length > 0 || date !== 'all' || format !== 'all' || query.length > 0;

  return (
    <div
      role="region"
      aria-label="Event filters"
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
        {EVENT_TOPIC_OPTIONS.map((topic) => {
          const pressed = topics.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              aria-pressed={pressed}
              onClick={() => toggleTopic(topic)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${pressed ? 'var(--accent)' : 'var(--border-mid)'}`,
                background: pressed ? 'var(--accent-dim)' : 'transparent',
                color: pressed ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {topic}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Date</span>
          <select
            aria-label="Date filter"
            value={date}
            onChange={(e) => setDate(e.target.value as typeof date)}
            style={selectStyle}
          >
            {EVENT_DATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div role="group" aria-label="Format filter" style={{ display: 'flex', gap: '4px' }}>
          {EVENT_FORMAT_OPTIONS.map((opt) => {
            const active = format === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFormat(opt.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border-mid)'}`,
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search event title or description"
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

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: '12px',
  padding: '6px 8px',
  cursor: 'pointer',
};
