'use client';
import React, { useState } from 'react';
import { Upload, Search, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Card, Button, ImageUploader } from './Shared';
import type { FileData, AnalysisState } from '../types';
import { analyzeImageWithGemini, fileToBase64 } from '../services/geminiService';

const Analyzer: React.FC = () => {
  const [image, setImage] = useState<FileData | null>(null);
  const [prompt, setPrompt] = useState<string>("Analyze this image and describe what you see in detail.");
  const [state, setState] = useState<AnalysisState>({
    result: null,
    isLoading: false,
    error: null
  });

  const handleFileSelect = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      setImage({
        file,
        previewUrl,
        base64,
        mimeType: file.type
      });
      setState({ result: null, isLoading: false, error: null });
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, error: "Failed to process image file." }));
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setState({ result: null, isLoading: true, error: null });
    try {
      const result = await analyzeImageWithGemini(image.base64, image.mimeType, prompt);
      setState({ result: result || null, isLoading: false, error: null });
    } catch (e: any) {
      setState({ result: null, isLoading: false, error: e.message || "Analysis failed." });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Image Analysis
        </h2>
        <p className="text-gray-400">Upload an image to understand its content using Gemini 3 Pro</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            {!image ? (
              <div className="h-64 flex flex-col justify-center">
                <ImageUploader onFileSelect={handleFileSelect} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative group rounded-lg overflow-hidden border border-gray-700 bg-black/50 aspect-video flex items-center justify-center">
                  <img 
                    src={image.previewUrl} 
                    alt="Preview" 
                    className="max-h-full max-w-full object-contain" 
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" onClick={() => setImage(null)}>
                      <RefreshCw className="w-4 h-4" /> Change Image
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Analysis Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
                    placeholder="Ask something specific about the image..."
                  />
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  disabled={state.isLoading} 
                  className="w-full"
                >
                  <Search className="w-4 h-4" /> 
                  {state.isLoading ? 'Analyzing...' : 'Analyze Image'}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Output Section */}
        <div className="h-full">
          <Card className="h-full min-h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Analysis Result
            </h3>
            
            <div className="flex-1 bg-gray-950/50 rounded-lg border border-gray-800 p-4 overflow-y-auto max-h-[600px]">
              {state.isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p>Gemini is examining your image...</p>
                </div>
              ) : state.error ? (
                <div className="h-full flex flex-col items-center justify-center text-red-400 gap-2">
                  <AlertCircle className="w-8 h-8" />
                  <p className="text-center px-4">{state.error}</p>
                </div>
              ) : state.result ? (
                <div className="prose prose-invert prose-blue max-w-none whitespace-pre-wrap text-gray-300 leading-relaxed">
                  {state.result}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                  <Search className="w-8 h-8 opacity-50" />
                  <p>Results will appear here</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analyzer;