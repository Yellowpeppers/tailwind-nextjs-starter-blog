'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/context/LanguageContext'

type PlanComparisonModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubscribe?: (interval?: 'month' | 'year') => void
}

export default function PlanComparisonModal({
  isOpen,
  onClose,
  onSubscribe,
}: PlanComparisonModalProps) {
  const { t } = useTranslation()
  const [interval, setInterval] = useState<'month' | 'year'>('month')

  const features = [
    {
      name: t.comparePlans.features.focusWidgets,
      free: t.comparePlans.values.basic,
      pro: t.comparePlans.values.allAccess,
    },
    {
      name: t.comparePlans.features.aiTaskBreaker,
      free: t.comparePlans.values.limitedTimes,
      pro: true,
    },
    { name: t.comparePlans.features.cloudSync, free: true, pro: true },
    { name: t.comparePlans.features.stats, free: true, pro: true },
    {
      name: t.comparePlans.features.customBackgrounds,
      free: false,
      pro: t.comparePlans.values.inDev,
    },
    { name: t.comparePlans.features.prioritySupport, free: false, pro: true },
    {
      name: t.comparePlans.features.unlimitedTasks,
      free: t.comparePlans.values.limit10,
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-3xl border border-gray-100 bg-white px-4 pt-5 pb-4 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-8">
                {/* Close Button */}
                <div className="absolute top-0 right-0 pt-6 pr-6">
                  <button
                    type="button"
                    className="rounded-full bg-gray-50 p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="w-full">
                  {/* Header Content */}
                  <div className="mb-8 text-center">
                    <Dialog.Title
                      as="h3"
                      className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
                    >
                      {t.comparePlans.title}
                    </Dialog.Title>
                    <p className="mt-2 text-gray-500">{t.comparePlans.subtitle}</p>
                  </div>

                  {/* Toggle Switch */}
                  <div className="mb-8 flex justify-center">
                    <div className="relative flex h-12 w-64 rounded-xl bg-gray-100 p-1 md:w-80">
                      <div className="relative z-10 grid h-full w-full grid-cols-2">
                        <button
                          onClick={() => setInterval('month')}
                          className={`flex items-center justify-center rounded-lg text-sm font-bold transition-colors duration-200 ${
                            interval === 'month'
                              ? 'text-white'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setInterval('year')}
                          className={`flex items-center justify-center rounded-lg text-sm font-bold transition-colors duration-200 ${
                            interval === 'year' ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          Yearly
                          <span
                            className={`${interval === 'year' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'} ml-2 rounded-full px-1.5 py-0.5 text-[10px] tracking-wide uppercase transition-colors`}
                          >
                            -17%
                          </span>
                        </button>
                      </div>
                      {/* Sliding Background */}
                      <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-blue-600 shadow-md transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                          interval === 'year' ? 'left-[calc(50%)]' : 'left-1'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
                          >
                            {t.comparePlans.columns.feature}
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-center text-xs font-bold tracking-wider text-gray-500 uppercase"
                          >
                            {t.comparePlans.columns.free}
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-center text-xs font-bold tracking-wider text-blue-600 uppercase"
                          >
                            {t.comparePlans.columns.pro}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {features.map((feature, idx) => (
                          <tr
                            key={feature.name}
                            className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                          >
                            <td className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                              {feature.name}
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-500">
                              {feature.free === false ? (
                                <span className="text-gray-300">-</span>
                              ) : feature.free === true ? (
                                <CheckIcon className="mx-auto h-5 w-5 text-gray-400" />
                              ) : (
                                feature.free
                              )}
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                              {feature.pro === true ? (
                                <div className="flex items-center justify-center">
                                  <div className="rounded-full bg-blue-100 p-1">
                                    <CheckIcon className="h-4 w-4 text-blue-600" />
                                  </div>
                                </div>
                              ) : (
                                feature.pro
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-8 text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                        {interval === 'month' ? '$4.99' : '$49.99'}
                      </span>
                      <span className="text-lg font-medium text-gray-500">
                        /{interval === 'month' ? 'month' : 'year'}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">7-day free trial, cancel anytime.</p>

                    {onSubscribe && (
                      <button
                        onClick={() => onSubscribe(interval)}
                        className="mt-6 w-full rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-300 active:translate-y-0 active:scale-[0.98]"
                      >
                        Start 7-Day Free Trial
                      </button>
                    )}

                    <p className="mt-4 text-xs text-gray-400">{t.comparePlans.beta.description}</p>
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
