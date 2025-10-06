import { ArrowLeft } from 'lucide-react'

const PageHeader = ({ 
  title, 
  subtitle, 
  backUrl = '/admin',
  actions = [],
  showLogo = true 
}) => {
  return (
    <header className="header-gradient shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            {backUrl && (
              <a href={backUrl} className="mr-4">
                <ArrowLeft className="h-6 w-6 text-white hover:text-qassim-gold" />
              </a>
            )}
            {showLogo && (
              <div className="mr-4">
                <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
              </div>
            )}
            <div className="ml-4">
              <p className="text-white text-sm font-medium">
                {title}
              </p>
              {subtitle && (
                <div className="flex items-center mt-1 space-x-2">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          {actions.length > 0 && (
            <div className="flex items-center space-x-3">
              {actions.map((action, index) => (
                <div key={index}>
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default PageHeader
