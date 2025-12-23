import { useRef, useEffect } from 'react'
import { driver, DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useTranslation } from '@/context/LanguageContext'

const TOUR_STORAGE_KEY = 'focuslab_tour_completed_v1'

export const useFocusTour = () => {
  const { t } = useTranslation()
  const driverObj = useRef<ReturnType<typeof driver>>(null)

  const startTour = () => {
    if (!driverObj.current) return

    driverObj.current.drive()
  }

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile) return // Skip on mobile for now as grid is different

    const tourSteps: DriveStep[] = [
      {
        element: '#focus-lab-container', // We might need to add this ID to the main container
        popover: {
          title: t.focusLab.tour.welcome.title,
          description: t.focusLab.tour.welcome.description,
          side: 'center',
          align: 'center',
        },
      },
      {
        element: '.focuslab-grid',
        popover: {
          title: t.focusLab.tour.grid.title,
          description: t.focusLab.tour.grid.description,
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#widget-sonic',
        popover: {
          title: t.focusLab.tour.sonic.title,
          description: t.focusLab.tour.sonic.description,
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#widget-timer',
        popover: {
          title: t.focusLab.tour.timer.title,
          description: t.focusLab.tour.timer.description,
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#widget-todo',
        popover: {
          title: t.focusLab.tour.todo.title,
          description: t.focusLab.tour.todo.description,
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#widget-brain',
        popover: {
          title: t.focusLab.tour.brain.title,
          description: t.focusLab.tour.brain.description,
          side: 'left',
          align: 'center',
        },
      },
      {
        element: '#widget-breaker',
        popover: {
          title: t.focusLab.tour.breaker.title,
          description: t.focusLab.tour.breaker.description,
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#widget-dopamine',
        popover: {
          title: t.focusLab.tour.dopamine.title,
          description: t.focusLab.tour.dopamine.description,
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#sidebar-stats',
        popover: {
          title: t.focusLab.tour.stats.title,
          description: t.focusLab.tour.stats.description,
          side: 'right',
          align: 'center',
        },
      },
      {
        element: '#sidebar-goal',
        popover: {
          title: t.focusLab.tour.goal.title,
          description: t.focusLab.tour.goal.description,
          side: 'right',
          align: 'center',
        },
      },
    ]

    // Initialize driver
    driverObj.current = driver({
      showProgress: true,
      steps: tourSteps,
      nextBtnText: t.focusLab.tour.next,
      prevBtnText: t.focusLab.tour.prev,
      doneBtnText: t.focusLab.tour.done,
      allowClose: true,
      onDestroyStarted: () => {
        if (!driverObj.current?.hasNextStep() || confirm(t.focusLab.tour.skip || 'Skip tour?')) {
          localStorage.setItem(TOUR_STORAGE_KEY, 'true')
          driverObj.current?.destroy()
        }
      },
    })

    // Auto-start if not completed
    const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!hasCompleted) {
      // Gives a small delay for DOM to settle
      setTimeout(() => {
        driverObj.current?.drive()
      }, 1500)
    }
  }, [t])

  return { startTour }
}
