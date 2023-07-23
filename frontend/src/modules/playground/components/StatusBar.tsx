import React from 'react'
import cn from 'classnames'
import { PanelTypes, Panels } from '../pages/PlaygroundPage'
type Props = {
  onUpdateView: (type: Panels) => void
  showEditor: boolean
  showTerminal: boolean
  showBrowser: boolean
}

const StatusBar = (props: Props) => {
  const {
    onUpdateView = (type) => {},
    showEditor,
    showTerminal,
    showBrowser,
  } = props

  const allVisible = showEditor && showTerminal && showBrowser
  return (
    <div className='flex items-center justify-between border-t-2 border-gray-700  text-white'>
      <div></div>
      <div className='flex items-center text-white text-xs space-x-1'>
        <div
          className={cn(
            'cursor-pointer px-2 py-1',
            showTerminal && !allVisible && 'bg-gray-800'
          )}
          onClick={() => onUpdateView(PanelTypes.terminal)}
        >
          Terminal
        </div>
        <div
          className={cn(
            'cursor-pointer px-2 py-1',
            showEditor && !allVisible && 'bg-gray-800'
          )}
          onClick={() => onUpdateView(PanelTypes.editor)}
        >
          Editor
        </div>
        <div
          className={cn(
            'cursor-pointer px-2 py-1',
            showBrowser && !allVisible && 'bg-gray-800'
          )}
          onClick={() => onUpdateView(PanelTypes.browser)}
        >
          Browser
        </div>
        <div
          className={cn(
            'cursor-pointer px-2 py-1',
            allVisible && 'bg-gray-800'
          )}
          onClick={() => onUpdateView(PanelTypes.all)}
        >
          All
        </div>
      </div>
    </div>
  )
}

export default StatusBar
