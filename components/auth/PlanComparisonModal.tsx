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
      name: t.comparePlans.features.bubuAI || 'BuBu AI 助手',
      free: t.comparePlans.values.tenPerDay || '10 次/天',
      pro: t.comparePlans.values.unlimited,
    },
    {
      name: t.comparePlans.features.aiTaskBreaker,
      free: t.comparePlans.values.threePerDay,
      pro: true,
    },
    {
      name: t.comparePlans.features.voiceInput || '语音输入',
      free: false,
      pro: true,
    },
    {
      name: t.comparePlans.features.bubuPersonality || 'BuBu 性格切换',
      free: t.comparePlans.values.gentleOnly || '仅温柔',
      pro: t.comparePlans.values.allThree || '全部 3 种',
    },
    { name: t.comparePlans.features.cloudSync, free: true, pro: true },
    {
      name: t.comparePlans.features.stats,
      free: t.comparePlans.values.basic,
      pro: t.comparePlans.values.detailedReport || '详细报表',
    },
    {
      name: t.comparePlans.features.taskHistory || '任务历史',
      free: false,
      pro: true,
    },
    {
      name: t.comparePlans.features.unlimitedTasks,
      free: t.comparePlans.values.limit20 || '最多 20 个',
      pro: t.comparePlans.values.unlimited,
    },
    { name: t.comparePlans.features.prioritySupport, free: false, pro: true },
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

        <div className="fixed inset-0 z-10 overflow-hidden">
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
              <Dialog.Panel className="no-scrollbar relative max-h-[85vh] transform overflow-y-auto rounded-3xl border border-gray-100 bg-white px-4 pt-5 pb-4 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-8">
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

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    {/* Left: Comparison Table */}
                    <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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
                              <td className="px-6 py-4 text-left text-sm font-medium whitespace-nowrap text-gray-900">
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

                    {/* Right: Pricing & Action */}
                    <div className="flex w-full flex-col items-center gap-6 rounded-2xl border border-blue-50 bg-blue-50/30 p-6 lg:w-80 lg:shrink-0 dark:border-blue-900/20 dark:bg-blue-900/10">
                      {/* Toggle Switch */}
                      <div className="relative flex h-10 w-full rounded-lg bg-gray-200/80 p-1 backdrop-blur-sm">
                        <div className="relative z-10 grid h-full w-full grid-cols-2">
                          <button
                            onClick={() => setInterval('month')}
                            className={`flex items-center justify-center rounded-md text-xs font-bold transition-colors duration-200 ${
                              interval === 'month'
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            {t.comparePlans.intervals.month}
                          </button>
                          <button
                            onClick={() => setInterval('year')}
                            className={`flex items-center justify-center gap-1 rounded-md text-xs font-bold transition-colors duration-200 ${
                              interval === 'year'
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            {t.comparePlans.intervals.year}
                            <span
                              className={`${
                                interval === 'year'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-green-100 text-green-700'
                              } rounded-full px-1.5 py-0.5 text-[9px] tracking-wide uppercase transition-colors`}
                            >
                              {t.comparePlans.billing.savePercent}
                            </span>
                          </button>
                        </div>
                        {/* Sliding Background */}
                        <div
                          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                            interval === 'year' ? 'left-[calc(50%)]' : 'left-1'
                          }`}
                        />
                      </div>

                      {/* Price Display */}
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                            {interval === 'month' ? '$4.99' : '$49.99'}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            /
                            {interval === 'month'
                              ? t.comparePlans.intervals.monthShort
                              : t.comparePlans.intervals.yearShort}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {t.comparePlans.billing.cancelAnytime}
                        </p>
                      </div>

                      {/* CTA Button */}
                      {onSubscribe && (
                        <button
                          onClick={() => onSubscribe(interval)}
                          className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-300 active:translate-y-0 active:scale-[0.98]"
                        >
                          {t.comparePlans.cta.startTrial}
                        </button>
                      )}

                      <p className="px-4 text-center text-[10px] leading-tight text-gray-400">
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
