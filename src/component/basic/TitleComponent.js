import Link from 'next/link';

export default function TitleComponent({ icon, title, link }) {
  return (
    <div className="site-section-heading">
      {icon && <span className="site-section-heading__icon" aria-hidden="true">{icon}</span>}
      <h2><Link href={link}>{title}</Link></h2>
    </div>
  );
}
