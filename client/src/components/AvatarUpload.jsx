import React, { useState, useRef } from 'react'
import { Camera, Upload, X, User } from 'lucide-react'

const AvatarUpload = ({ 
  currentAvatar, 
  onAvatarChange, 
  size = 'large',
  editable = true 
}) => {
  const [preview, setPreview] = useState(currentAvatar)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-24 h-24',
    xlarge: 'w-32 h-32'
  }

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target.result
        setPreview(result)
        onAvatarChange(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeAvatar = () => {
    setPreview(null)
    onAvatarChange(null)
  }

  const openFileDialog = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="relative">
      {/* Avatar Display */}
      <div
        className={`${sizes[size]} rounded-full bg-gray-200 flex items-center justify-center cursor-pointer relative overflow-hidden group ${
          editable ? 'hover:bg-gray-300' : ''
        } ${isDragging ? 'ring-2 ring-qassim-blue' : ''}`}
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <User className="w-1/2 h-1/2 text-gray-400" />
        )}

        {/* Upload Overlay */}
        {editable && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center rounded-full">
            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        )}

        {/* Remove Button */}
        {editable && preview && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeAvatar()
            }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* File Input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {/* Upload Instructions */}
      {editable && !preview && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Click to upload photo
        </div>
      )}
    </div>
  )
}

export default AvatarUpload
