import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type CategoryItem = {
  title: string;
  description: string;
  links: {label: string; to: string}[];
};

const Categories: CategoryItem[] = [
  {
    title: 'External',
    description: 'Guides for tournament participants and streamers.',
    links: [
      {label: 'OBS Overlay Setup', to: '/docs/external/obs-overlay-setup'},
      {label: 'Custom HUD Bridge', to: '/docs/external/custom-hud-bridge'},
      {label: 'Custom CSS Classes', to: '/docs/external/overlay-custom-classes'},
    ],
  },
  {
    title: 'Internal',
    description: 'Technical reference for CompSaber developers.',
    links: [
      {label: 'Socket Rooms', to: '/docs/internal/socket-rooms'},
    ],
  },
  {
    title: 'Examples',
    description: 'Ready-to-use overlay templates and code samples.',
    links: [
      {label: 'VS Screen (BYOH)', to: '/docs/examples/BYOH/vs'},
      {label: 'Play Screen (BYOH)', to: '/docs/examples/BYOH/play'},
      {label: 'Picks & Bans (BYOH)', to: '/docs/examples/BYOH/picks-bans'},
      {label: '1v1 Match Page (TS)', to: '/docs/examples/typescript/1v1-match-page'},
    ],
  },
];

function CategoryCard({title, description, links}: CategoryItem): ReactNode {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{description}</p>
      <ul className={styles.cardLinks}>
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className={styles.grid}>
        {Categories.map((c) => (
          <CategoryCard key={c.title} {...c} />
        ))}
      </div>
    </section>
  );
}
