import { IconType } from 'react-icons';
import { Icons } from '.';

interface playground {
  icon: IconType;
  title: string;
  description: string;
  repoName?: string;
  available: boolean;
  type: string;
}

export const playgrounds: Array<playground> = [
  {
    icon: Icons.Html,
    title: 'HTML/CSS',
    type: 'html',
    description: 'Vanilla HTML/CSS/JS playground',
    available: false,
  },
  {
    icon: Icons.React,
    title: 'React',
    type: 'viteReact',
    description: 'React playground using Vite',
    available: true,
  },
  {
    icon: Icons.Vue3,
    title: 'Vue3',
    type: 'vue3',
    description: 'Vue 3 playground using Vite',
    available: false,
  },
  {
    icon: Icons.Solidity,
    title: 'Solidity',
    type: 'solidity',
    description: 'Hardhat based solidity playground',
    available: false,
  },
  {
    icon: Icons.Python,
    title: 'Python',
    type: 'python',
    description: 'Python 3 playground',
    available: false,
  },
  {
    icon: Icons.Java,
    title: 'Java',
    type: 'java',
    description: 'Java playground',
    available: false,
  },
  {
    icon: Icons.NextJs,
    title: 'NextJs',
    type: 'nextjs',
    description: 'Next.js 12 playground',
    available: false,
  },
];
