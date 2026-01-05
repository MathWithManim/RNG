'use client';
import React, { useState } from 'react';
import { Wand2, Download, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, Button, ImageUploader } from './Shared';
import type { FileData, EditState } from '../types';
import { editImageWithGemini, fileToBase64 } from '../services/geminiService';

const Editor: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<FileData | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [state, setState] = useState<EditState>({
    generatedImage: null,
    isLoading: false,
    error: null
  });

  const handleFileSelect = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      setSourceImage({
        file,
        previewUrl,
        base64,
        mimeType: file.type
      });
      setState({ generatedImage: null, isLoading: false, error: null });
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, error: "Failed to process image." }));
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage || !prompt.trim()) return;

    setState({ generatedImage: null, isLoading: true, error: null });
    try {
      const resultBase64 = await editImageWithGemini(sourceImage.base64, sourceImage.mimeType, prompt);
      setState({ generatedImage: resultBase64, isLoading: false, error: null });
    } catch (e: any) {
      setState({ generatedImage: null, isLoading: false, error: e.message || "Editing failed." });
    }
  };

  const handleDownload = () => {
    if (state.generatedImage) {
      const link = document.createElement('a');
      link.href = state.generatedImage;
      link.download = `gemini-edited-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Creative Editor
        </h2>
        <p className="text-gray-400">Modify images with natural language using Gemini 2.5 Flash Image</p>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm text-gray-400 font-medium mb-1 block">Edit Instruction</label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., 'Add a retro filter', 'Make it snowy', 'Remove the background person'"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={state.isLoading || !sourceImage || !prompt.trim()} 
              className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 focus:ring-purple-500"
            >
              <Wand2 className="w-4 h-4" /> 
              {state.isLoading ? 'Generating...' : 'Generate Edit'}
            </Button>
          </div>
        </Card>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Source */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Original</h3>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center relative">
              {!sourceImage ? (
                <div className="p-8 w-full">
                  <ImageUploader onFileSelect={handleFileSelect} />
                </div>
              ) : (
                <>
                  <img 
                    src={sourceImage.previewUrl} 
                    alt="Original" 
                    className="max-w-full max-h-[600px] object-contain" 
                  />
                  <div className="absolute top-4 right-4">
                     <Button variant="secondary" onClick={() => setSourceImage(null)} className="opacity-75 hover:opacity-100">
                        <RefreshCw className="w-4 h-4" /> Reset
                     </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Result</h3>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
              {state.isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-purple-400 animate-pulse">Creating magic...</p>
                </div>
              ) : state.error ? (
                <div className="text-center p-8 max-w-sm">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <p className="text-red-400">{state.error}</p>
                </div>
              ) : state.generatedImage ? (
                <>
                  <img 
                    src={state.generatedImage} 
                    alt="Generated" 
                    className="max-w-full max-h-[600px] object-contain" 
                  />
                  <div className="absolute bottom-4 right-4">
                    <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-500 focus:ring-green-500 shadow-lg">
                      <Download className="w-4 h-4" /> Save
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-gray-700 flex flex-col items-center gap-2">
                  <ArrowRight className="w-8 h-8 opacity-20" />
                  <p>Edited image will appear here</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Editor;