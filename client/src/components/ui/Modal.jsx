import { useEffect } from 'react'
import { X } from 'lucide-react'

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
}

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'lg', // sm, md, lg, xl, 2xl, 4xl
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-navy-950/40 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`my-8 w-full overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl ${sizeClasses[size] || sizeClasses.lg}`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 border-b border-navy-100 px-6 py-4">
            <div className="min-w-0">
              {title && <h3 className="font-serif text-xl text-navy-800">{title}</h3>}
              {subtitle && <p className="mt-0.5 text-xs text-navy-500">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-navy-100 bg-navy-50/60 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
