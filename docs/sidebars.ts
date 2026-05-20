import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: [
        'architecture/overview',
      ],
    },
    {
      type: 'category',
      label: 'Backend',
      collapsed: false,
      items: [
        'backend/api-endpoints',
        'backend/authentication',
        'backend/mmr-ranking',
        'backend/models',
      ],
    },
    {
      type: 'category',
      label: 'Frontend',
      collapsed: false,
      items: [
        'frontend/overview',
        'frontend/components',
        'frontend/pages',
        'frontend/hooks-services',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      collapsed: false,
      items: [
        'tutorial/register',
        'tutorial/login',
        'tutorial/using-platform',
      ],
    },
    {
      type: 'category',
      label: 'Local Development',
      collapsed: false,
      items: [
        'local-development/setup',
        'local-development/environment-variables',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      collapsed: true,
      items: [
        'deployment/cloud',
        'deployment/environment',
      ],
    },
    {
      type: 'category',
      label: 'GitHub & Workflow',
      collapsed: true,
      items: [
        'github/structure',
        'github/commits',
      ],
    },
    {
      type: 'doc',
      id: 'design-decisions',
      label: 'Design Decisions',
    },
  ],
};

export default sidebars;
