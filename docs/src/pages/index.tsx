import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

// Feature cards data
const features = [
  {
    icon: '🏆',
    title: 'MMR Ranking System',
    description:
      'Seven-tier ranking system (Bronze to Elite) with tier-specific gain and loss rates. Climb the ranks through competitive play.',
  },
  {
    icon: '🎮',
    title: 'Competitive Lobbies',
    description:
      'Create or join lobbies for League of Legends, Pokemon Showdown, and more. Manage participants and track match results.',
  },
  {
    icon: '🔗',
    title: 'Riot Games Integration',
    description:
      'Link your official Riot account via RSO OAuth. Verify match results directly through the Riot API for League of Legends.',
  },
  {
    icon: '📊',
    title: 'Live Leaderboard',
    description:
      'Global leaderboard sorted by MMR. See your rank position, win/loss record, and tier badge at a glance.',
  },
  {
    icon: '🛡️',
    title: 'Secure Authentication',
    description:
      'JWT tokens stored in httpOnly cookies prevent XSS token theft. Email verification required before first login.',
  },
  {
    icon: '⚙️',
    title: 'Admin Dashboard',
    description:
      'Full user and lobby management for administrators. Platform statistics, role management, and content moderation.',
  },
];

// Rank tier data
const tiers = [
  {name: 'Bronze',   range: '0–499',    color: '#cd7f32'},
  {name: 'Silver',   range: '500–999',  color: '#9e9e9e'},
  {name: 'Gold',     range: '1000–1499', color: '#ffc107'},
  {name: 'Platinum', range: '1500–1999', color: '#90caf9'},
  {name: 'Diamond',  range: '2000–2499', color: '#4fc3f7'},
  {name: 'Master',   range: '2500–2999', color: '#ce93d8'},
  {name: 'Elite',    range: '3000+',    color: '#ef5350'},
];

// Quick navigation links
const quickLinks = [
  {
    title: 'Quick Start',
    desc: 'Set up G-RANK locally in minutes',
    to: '/docs/local-development/setup',
  },
  {
    title: 'API Reference',
    desc: 'All REST endpoints with examples',
    to: '/docs/backend/api-endpoints',
  },
  {
    title: 'Architecture',
    desc: 'How the system is designed',
    to: '/docs/architecture/overview',
  },
  {
    title: 'MMR System',
    desc: 'Ranking tiers and calculation rules',
    to: '/docs/backend/mmr-ranking',
  },
  {
    title: 'Frontend Guide',
    desc: 'Components, pages, and hooks',
    to: '/docs/frontend/overview',
  },
  {
    title: 'Deploy to Cloud',
    desc: 'Vercel + Railway deployment guide',
    to: '/docs/deployment/cloud',
  },
];

function HeroBanner() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <Heading as="h1">{siteConfig.title}</Heading>
        <p>{siteConfig.tagline}</p>
        <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginTop: '-0.5rem'}}>
          Full-stack esports platform — Node.js + Express + MongoDB + React 19 + Vite
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            Read the Docs
          </Link>
          <Link
            className="button button--outline button--lg"
            style={{color: '#fff', borderColor: 'rgba(255,255,255,0.5)'}}
            to="/docs/local-development/setup">
            Get Started
          </Link>
          <Link
            className="button button--outline button--lg"
            style={{color: '#fff', borderColor: 'rgba(255,255,255,0.5)'}}
            href="https://github.com/Vega8991/G-RANK">
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Platform Features
        </Heading>
        <p className={styles.sectionSubtitle}>
          Everything needed to run competitive gaming tournaments
        </p>
        <div className={styles.featureGrid}>
          {features.map(({icon, title, description}) => (
            <div key={title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{icon}</div>
              <div className={styles.featureTitle}>{title}</div>
              <div className={styles.featureDescription}>{description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TiersSection() {
  return (
    <section className={styles.tiersSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Rank Tiers
        </Heading>
        <p className={styles.sectionSubtitle}>
          Seven tiers with tier-specific MMR gain and loss rates
        </p>
        <div className={styles.tierGrid}>
          {tiers.map(({name, range, color}) => (
            <div key={name} className={styles.tierCard}>
              <div className={styles.tierName} style={{color}}>
                {name}
              </div>
              <div className={styles.tierRange}>{range} MMR</div>
            </div>
          ))}
        </div>
        <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
          <Link to="/docs/backend/mmr-ranking" className="button button--primary button--sm">
            View MMR Details
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuickLinksSection() {
  return (
    <section className={styles.quickLinksSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Documentation Sections
        </Heading>
        <p className={styles.sectionSubtitle}>
          Jump directly to what you need
        </p>
        <div className={styles.quickLinksGrid}>
          {quickLinks.map(({title, desc, to}) => (
            <Link key={title} to={to} className={styles.quickLink}>
              <div className={styles.quickLinkTitle}>{title}</div>
              <div className={styles.quickLinkDesc}>{desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStackSection() {
  return (
    <section style={{padding: '3rem 0', background: 'var(--ifm-color-emphasis-100)'}}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Tech Stack
        </Heading>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
        }}>
          {[
            {label: 'Backend', items: ['Node.js 18+', 'Express 5', 'MongoDB + Mongoose 9', 'JWT + Bcrypt', 'Nodemailer']},
            {label: 'Frontend', items: ['React 19 + TypeScript', 'Vite 7', 'Tailwind CSS v4', 'React Router v7', 'Framer Motion']},
            {label: 'Visual FX', items: ['Three.js', 'React Three Fiber', 'GSAP', 'WebGL Shaders', 'CSS Animations']},
            {label: 'Infrastructure', items: ['MongoDB Atlas', 'Vercel (frontend)', 'Railway / Render (API)', 'GitHub (monorepo)', 'Gmail SMTP']},
          ].map(({label, items}) => (
            <div key={label} style={{
              padding: '1.25rem',
              borderRadius: '8px',
              background: 'var(--ifm-background-color)',
              border: '1px solid var(--ifm-color-emphasis-200)',
            }}>
              <div style={{fontWeight: 700, marginBottom: '0.75rem', color: 'var(--ifm-color-primary)'}}>{label}</div>
              <ul style={{margin: 0, paddingLeft: '1.2rem'}}>
                {items.map((item) => (
                  <li key={item} style={{fontSize: '0.9rem', marginBottom: '0.25rem'}}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="G-RANK — Competitive Gaming Platform Documentation. Full-stack esports platform with MMR ranking, lobby management, and Riot Games integration.">
      <HeroBanner />
      <main>
        <FeaturesSection />
        <TiersSection />
        <TechStackSection />
        <QuickLinksSection />
      </main>
    </Layout>
  );
}
