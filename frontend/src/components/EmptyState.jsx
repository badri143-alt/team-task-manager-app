export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty">
      <div className="empty-ico">✦</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
