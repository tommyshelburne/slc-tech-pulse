import { useParams } from 'react-router-dom';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Event Detail</h1>
      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Event ID: {id}</p>
    </div>
  );
}
