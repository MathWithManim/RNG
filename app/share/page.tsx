'use client';
import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, File, Copy, Check, AlertCircle, Globe, Zap, Shield } from 'lucide-react';

export default function SharePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      // Validate file size (100MB limit)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size exceeds 100MB limit');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setDownloadUrl(null);
    setProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to API route
      const response = await fetch('/api/share/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Get the custom IP configuration
      const configResponse = await fetch('/api/config');
      const config = await configResponse.json();
      const customIP = config.customIP;

      setDownloadUrl(`${customIP}/api/share/download/${result.id}/${encodeURIComponent(file.name)}`);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (downloadUrl) {
      navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDownloadUrl(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-gray-900 to-black py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-500">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            SlipShare
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Instantly share files with anyone. No registration required.
          </p>
        </div>

        <div className="bg-zinc-900/70 backdrop-blur-lg rounded-2xl border border-zinc-800 p-6 md:p-8 shadow-2xl shadow-purple-900/10">
          {!downloadUrl ? (
            <div className="space-y-8">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  file ? 'border-purple-500/50 bg-purple-900/10' : 'border-zinc-700 hover:border-zinc-600'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <Upload className="w-12 h-12 mx-auto text-zinc-500 mb-4" />
                <p className="text-lg font-medium mb-2 text-white">
                  {file ? file.name : 'Click to select a file or drag and drop'}
                </p>
                <p className="text-sm text-zinc-500">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Max 100MB • Any file type'}
                </p>
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    !file || uploading
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/20'
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading {progress}%</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload File</span>
                    </>
                  )}
                </button>

                {file && (
                  <button
                    onClick={handleReset}
                    className="py-3 px-6 rounded-xl font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8">
              <div className="p-4 bg-green-900/20 rounded-xl inline-block">
                <File className="w-12 h-12 mx-auto text-green-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">File Uploaded Successfully!</h2>
                <p className="text-zinc-400">Your file is ready to share</p>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4 max-w-md mx-auto">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={downloadUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm md:text-base text-white overflow-x-auto py-2 px-3 focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors"
                    title="Copy link"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="py-3 px-6 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/20 transition-all"
                >
                  Share Another File
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800">
            <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-medium text-white mb-2">Secure Sharing</h3>
            <p className="text-sm text-zinc-400">Files are encrypted during transfer and stored securely.</p>
          </div>
          <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-medium text-white mb-2">Instant Access</h3>
            <p className="text-sm text-zinc-400">Share files with anyone using a simple link.</p>
          </div>
          <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800">
            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-medium text-white mb-2">Temporary Storage</h3>
            <p className="text-sm text-zinc-400">Files are automatically deleted after 24 hours.</p>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} SlipShare. Secure file sharing made simple.</p>
        </div>
      </div>
    </div>
  );
}