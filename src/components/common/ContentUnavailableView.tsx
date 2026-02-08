import StatusView from './StatusView';

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
    <StatusView
      symbol={<i className={`bi ${icon} fs-1 text-secondary`} />}
      title={title}
      description={description}
    />
  );
}
