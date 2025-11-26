import projectsData from '@/data/projectsData'
import Card from '@/components/Card'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Interactive Tools' })

export default function Projects() {
  const totalProjects = projectsData.length
  const remainingIsOdd = (Math.max(totalProjects - 1, 0)) % 2 === 1

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Interactive Tools
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Science-backed utilities to help you screen symptoms, focus better, and regulate sensory input.
          </p>
        </div>
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-2">
            {projectsData.map((project, index) => {
              const isHero = index === 0
              const isLast = index === totalProjects - 1
              const spanFullWidth = isHero || (!isHero && isLast && remainingIsOdd)

              return (
                <Card
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  imgSrc={project.imgSrc}
                  href={project.href}
                  className={spanFullWidth ? 'md:col-span-2' : undefined}
                />
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
