import { useUIStore } from '../../store/uiStore';
import { COMPANY_SIZE_OPTIONS, COMPANY_TOPIC_OPTIONS } from '../../utils/filters';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';

export function CompanyFilters() {
  const hiring = useUIStore((s) => s.companyHiringFilter);
  const size = useUIStore((s) => s.companySizeFilter);
  const topics = useUIStore((s) => s.companyTopicFilter);
  const query = useUIStore((s) => s.searchQuery);
  const setHiring = useUIStore((s) => s.setCompanyHiringFilter);
  const setSize = useUIStore((s) => s.setCompanySizeFilter);
  const setTopics = useUIStore((s) => s.setCompanyTopicFilter);
  const setQuery = useUIStore((s) => s.setSearchQuery);
  const clearFilters = useUIStore((s) => s.clearFilters);

  const toggleTopic = (topic: string) => {
    if (topics.includes(topic)) {
      setTopics(topics.filter((t) => t !== topic));
    } else {
      setTopics([...topics, topic]);
    }
  };

  const hasActiveFilters = hiring || size !== 'all' || topics.length > 0 || query.length > 0;

  return (
    <div
      role="region"
      aria-label="Company filters"
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
        {COMPANY_TOPIC_OPTIONS.map((topic) => {
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
        <button
          type="button"
          aria-pressed={hiring}
          onClick={() => setHiring(!hiring)}
          style={pillStyle(hiring)}
        >
          Hiring only
        </button>

        <div role="group" aria-label="Size filter" style={{ display: 'flex', gap: '4px' }}>
          {COMPANY_SIZE_OPTIONS.map((opt) => {
            const active = size === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => setSize(opt.value)}
                style={pillStyle(active)}
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
            placeholder="Search name or description"
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
