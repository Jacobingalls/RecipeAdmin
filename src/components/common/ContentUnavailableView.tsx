interface ContentUnavailableViewProps {
  icon: string;
  title: string;
  description?: string;
}

/**
 * Centered empty state with icon, title, and optional description.
 * Inspired by SwiftUI's ContentUnavailableView.
 */
export default function ContentUnavailableView({
  icon,
  title,
  description,
}: ContentUnavailableViewProps) {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon} fs-1 text-secondary`} />
      <h5 className="fw-semibold mt-2">{title}</h5>
      {description && <p className="text-secondary mb-0">{description}</p>}
    </div>
  );
}
