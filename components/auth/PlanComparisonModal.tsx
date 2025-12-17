'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/context/LanguageContext'

type PlanComparisonModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function PlanComparisonModal({ isOpen, onClose }: PlanComparisonModalProps) {
  const { t } = useTranslation()

  const features = [
    {
      name: t.comparePlans.features.focusWidgets,
      free: t.comparePlans.values.basic,
      pro: t.comparePlans.values.allAccess,
    },
    { name: t.comparePlans.features.aiTaskBreaker, free: false, pro: true },
    { name: t.comparePlans.features.cloudSync, free: false, pro: true },
    { name: t.comparePlans.features.stats, free: false, pro: true },
    {
      name: t.comparePlans.features.customBackgrounds,
      free: t.comparePlans.values.inDev,
      pro: t.comparePlans.values.inDev,
    },
    { name: t.comparePlans.features.prioritySupport, free: false, pro: true },
    {
      name: t.comparePlans.features.unlimitedTasks,
      free: t.comparePlans.values.limit20,
      pro: t.comparePlans.values.unlimited,
    },
  ]

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[210]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 dark:bg-gray-900">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none dark:bg-gray-900 dark:text-gray-500 dark:hover:text-gray-400"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="mb-2 text-center text-2xl leading-6 font-bold text-gray-900 dark:text-white"
                    >
                      {t.comparePlans.title}
                    </Dialog.Title>
                    <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      {t.comparePlans.subtitle}
                    </p>

                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                            >
                              {t.comparePlans.columns.feature}
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-center text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                            >
                              <div className="flex flex-col">
                                <span>{t.comparePlans.columns.free}</span>
                                <span className="mt-1 text-sm font-normal text-gray-400">$0</span>
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-center text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400"
                            >
                              <div className="flex flex-col">
                                <span>{t.comparePlans.columns.pro}</span>
                                <span className="mt-1 text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                                  $5<span className="text-xs font-normal">/mo</span>
                                </span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                          {features.map((feature, featureIdx) => (
                            <tr
                              key={feature.name}
                              className={
                                featureIdx % 2 === 0
                                  ? 'bg-white dark:bg-gray-900'
                                  : 'bg-gray-50 dark:bg-gray-800/50'
                              }
                            >
                              <td className="px-6 py-4 text-left text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
                                {feature.name}
                              </td>
                              <td className="px-6 py-4 text-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                {feature.free === false ? (
                                  <span className="text-red-400">✕</span>
                                ) : feature.free === true ? (
                                  <span className="text-green-500">✓</span>
                                ) : (
                                  feature.free
                                )}
                              </td>
                              <td className="px-6 py-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
                                {feature.pro === true ? (
                                  <span className="flex items-center justify-center">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                                      ✓
                                    </span>
                                  </span>
                                ) : (
                                  feature.pro
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-8 rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {t.comparePlans.beta.msgPre}
                        <span className="font-bold">{t.comparePlans.beta.planName}</span>
                        {t.comparePlans.beta.msgPost}
                      </p>
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-300">
                        {t.comparePlans.beta.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
