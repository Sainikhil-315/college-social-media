import React, { useState, useEffect } from "react";
import { Upload, X, Camera, CheckCircle } from "lucide-react";
import { postAPI } from "../api/post";

const Create = ({ isOpen, onClose }) => {
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageChange = (file) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleImageChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageChange(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !imageFile) return;

    const formData = new FormData();
    formData.append("description", description);
    formData.append("image", imageFile);

    setLoading(true);
    try {
      // Simulate API call
      await postAPI.createPost(formData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      setDescription("");
      setImageFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Enhanced Blurred Background */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-300"
        onClick={onClose}
      />

      {/* Enhanced Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100 opacity-100 translate-y-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Post
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6">
            {/* Drag & Drop Image Upload Area */}
            <div className="mb-6">
              {!preview ? (
                <div
                  className={`
                    relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
                    ${isDragOver 
                      ? 'border-blue-500 bg-blue-50 scale-105' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                  `}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`
                      p-4 rounded-full transition-all duration-300
                      ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}
                    `}>
                      <Upload className={`
                        w-8 h-8 transition-colors duration-300
                        ${isDragOver ? 'text-blue-500' : 'text-gray-400'}
                      `} />
                    </div>
                    
                    <div>
                      <p className="text-lg font-semibold text-gray-700 mb-1">
                        {isDragOver ? 'Drop your image here' : 'Upload an image'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Drag & drop or click to browse
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supports: JPG, PNG, GIF (Max 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative group" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log("Removing image");
                      removeImage();
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-colors duration-200" />
                </div>
              )}
            </div>

            {/* Enhanced Description Input */}
            <div className="mb-6">
              <div className="relative">
                <textarea
                  rows="4"
                  placeholder="Write a caption that captures the moment..."
                  className="w-full border-2 border-gray-300 rounded-2xl p-4 resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 placeholder-gray-400"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {description.length}/500
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className={`
                  flex-1 px-6 py-3 font-semibold rounded-2xl transition-all duration-300 disabled:cursor-not-allowed
                  ${loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95'
                  }
                  text-white shadow-lg hover:shadow-xl
                `}
                disabled={loading || !description || !imageFile}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Posting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Share Post</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced Success Notification */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-[60] transform opacity-100 translate-y-0 transition-all duration-500">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Post uploaded successfully!</span>
            </div>
            <div className="h-1 mt-3 bg-green-300/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/80 rounded-full" 
                style={{
                  animation: 'progressBar 2s ease-in-out',
                  '@keyframes progressBar': {
                    '0%': { width: '0%' },
                    '100%': { width: '100%' }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Create;