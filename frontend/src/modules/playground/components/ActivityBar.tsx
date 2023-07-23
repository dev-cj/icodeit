import React from 'react'

import '@vscode/codicons/dist/codicon.css'

import cn from 'classnames'

import styles from './activity-bar.module.css'

export type ActivityBarProps = {
  checked: number
  items: string[]
  sideBarVisible: boolean
  setActiveActivity: (index: number) => void
  toggleSidebar: (toggle: boolean) => void
}

export const ActivityBar = ({
  checked,
  items,
  sideBarVisible,
  setActiveActivity,
  toggleSidebar,
}: ActivityBarProps) => {
  return (
    <div
      className={
        'bg-[#252525] h-full overflow-hidden border-r border-gray-700 w-12'
      }
    >
      <div className={'flex flex-col justify-between'}>
        <div className={''}>
          {items.map((item, index) => (
            <button
              key={index}
              className={cn(
                'relative text-white h-[50px]',
                { [styles.checked]: index === checked && sideBarVisible },
                styles.iconButton
              )}
            >
              <div
                className={cn(
                  `codicon codicon-${item}`,
                  '!flex items-center justify-center w-12 h-12 text-white !text-2xl'
                )}
                onClick={() => {
                  setActiveActivity(index)
                  if (!sideBarVisible) {
                    toggleSidebar(true)
                  } else if (index === checked) {
                    toggleSidebar(false)
                  }
                }}
              ></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
