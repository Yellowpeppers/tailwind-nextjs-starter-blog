interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'Free Adult ADHD Assessment (ASRS v1.1)',
    description:
      'A private, scientifically validated screening tool based on WHO standards. No email required to start. Get your score and risk profile in 2 minutes.',
    imgSrc: '/static/images/project-test.png',
    href: '/test',
  },
  {
    title: 'Brown Noise Focus Generator',
    description:
      'Customizable brown, pink, and white noise soundscapes to block out distractions and soothe the ADHD brain.',
    imgSrc: '/static/images/project-noise.png',
    href: '/tools/noise',
  },
  {
    title: 'Dopamine Menu Randomizer',
    description: 'Spin up a healthy dopamine hit based on your available energy or time.',
    imgSrc: '/static/images/dopamine-card.png',
    href: '/tools/dopamine-menu',
  },
]

export default projectsData
