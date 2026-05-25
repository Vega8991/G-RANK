import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'G-RANK Docs',
  tagline: 'Competitive Gaming Platform Documentation',
  favicon: 'img/favicon.ico',

  // Production URL (Vercel deployment)
  url: 'https://g-rank-docs.vercel.app',
  baseUrl: '/',

  // GitHub repository info
  organizationName: 'Vega8991',
  projectName: 'G-RANK',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Vega8991/G-RANK/tree/main/docs/',
          routeBasePath: 'docs',
          showLastUpdateTime: false,
        },
        blog: false, // Disable the blog plugin
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'G-RANK Docs',
      logo: {
        alt: 'G-RANK Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/backend/api-endpoints',
          position: 'left',
          label: 'API Reference',
        },
        {
          to: '/docs/local-development/setup',
          position: 'left',
          label: 'Get Started',
        },
        {
          href: 'https://github.com/Vega8991/G-RANK',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Introduction',
              to: '/docs',
            },
            {
              label: 'Architecture',
              to: '/docs/architecture/overview',
            },
            {
              label: 'API Endpoints',
              to: '/docs/backend/api-endpoints',
            },
          ],
        },
        {
          title: 'Development',
          items: [
            {
              label: 'Local Setup',
              to: '/docs/local-development/setup',
            },
            {
              label: 'Environment Variables',
              to: '/docs/local-development/environment-variables',
            },
            {
              label: 'Cloud Deployment',
              to: '/docs/deployment/cloud',
            },
          ],
        },
        {
          title: 'Frontend',
          items: [
            {
              label: 'Overview',
              to: '/docs/frontend/overview',
            },
            {
              label: 'Components',
              to: '/docs/frontend/components',
            },
            {
              label: 'Pages',
              to: '/docs/frontend/pages',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Vega8991/G-RANK',
            },
            {
              label: 'Design Decisions',
              to: '/docs/design-decisions',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} G-RANK — TFG Project. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'javascript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
