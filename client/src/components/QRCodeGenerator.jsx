import React, { useState } from 'react'
import { QrCode, Download, Share, Copy, User, Phone, Mail, Building } from 'lucide-react'
import axios from 'axios'

const QRCodeGenerator = ({ employee, type = 'employee_card' }) => {
  const [qrCode, setQrCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const generateQRCode = async (qrType) => {
    setLoading(true)
    setError(null)
    
    try {
      const endpoint = qrType === 'contact' ? 'contact' : qrType === 'card' ? 'card' : 'employee'
      const response = await axios.get(`/api/qr/${endpoint}/${employee._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      setQrCode(response.data.data)
      setShowModal(true)
    } catch (error) {
      setError('Failed to generate QR code')
      console.error('QR generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCode?.qrCode) return
    
    const link = document.createElement('a')
    link.href = qrCode.qrCode
    link.download = `${employee.name}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyQRData = () => {
    if (qrCode?.employeeData) {
      navigator.clipboard.writeText(JSON.stringify(qrCode.employeeData, null, 2))
    } else if (qrCode?.vCard) {
      navigator.clipboard.writeText(qrCode.vCard)
    }
  }

  const shareContact = () => {
    if (qrCode?.vCard) {
      if (navigator.share) {
        navigator.share({
          title: `${employee.name} - Contact`,
          text: `Contact information for ${employee.name}`,
          url: qrCode.qrCode
        })
      } else {
        copyQRData()
      }
    }
  }

  return (
    <>
      {/* QR Code Button */}
      <button
        onClick={() => generateQRCode('employee')}
        disabled={loading}
        className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
      >
        <QrCode className="w-4 h-4 mr-1" />
        {loading ? 'Generating...' : 'Generate QR'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* QR Code Modal */}
      {showModal && qrCode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {type === 'contact' ? 'Contact QR Code' : 
                   type === 'card' ? 'Employee Card QR' : 'Employee QR Code'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Employee Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-3">
                  {employee.avatar ? (
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {employee.extension && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      Ext: {employee.extension}
                    </div>
                  )}
                  {employee.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {employee.email}
                    </div>
                  )}
                  {employee.department && (
                    <div className="flex items-center text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      {employee.department.name}
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <img
                  src={qrCode.qrCode}
                  alt="QR Code"
                  className="w-64 h-64 border border-gray-200 rounded-lg"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-qassim-blue text-white rounded-lg hover:bg-qassim-blue-dark transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                
                <button
                  onClick={copyQRData}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Data
                </button>
                
                {type === 'contact' && (
                  <button
                    onClick={shareContact}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </button>
                )}
              </div>

              {/* QR Code Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>QR Code Type:</strong> {type === 'contact' ? 'vCard Contact' : 
                   type === 'card' ? 'Employee Card' : 'Employee Data'}
                </p>
                {qrCode.generatedAt && (
                  <p className="text-xs text-blue-800">
                    <strong>Generated:</strong> {new Date(qrCode.generatedAt).toLocaleString()}
                  </p>
                )}
                {qrCode.validUntil && (
                  <p className="text-xs text-blue-800">
                    <strong>Valid Until:</strong> {new Date(qrCode.validUntil).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default QRCodeGenerator
