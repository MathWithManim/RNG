
'use client';
import React, { useState } from 'react';
import { X, MessageSquare, AlertCircle, Mail, Cloud, ShieldAlert, Copy } from 'lucide-react';
import { Card, Button } from './Shared';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<'idle' | 'success_email' | 'error'>('idle');
  const [errorDetails, setErrorDetails] = useState<string>("");

  if (!isOpen) return null;

  // Open Email Client Only
  const handleEmailSubmit = () => {
    if (!message.trim()) return;

    try {
        const subject = encodeURIComponent("Cosmic RNG Feedback");
        const body = encodeURIComponent(`From: ${contact}\n\nMessage:\n${message}`);
        window.location.href = `mailto:mathmanim09@gmail.com?subject=${subject}&body=${body}`;

        setStatus('success_email');
        setTimeout(() => resetForm(), 3000);
    } catch (e) {
        console.error("Email Error:", e);
        setStatus('error');
    }
  };

  const resetForm = () => {
      setStatus('idle');
      setMessage("");
      setContact("");
      setErrorDetails("");
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-gray-900 border-gray-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Send Feedback</h2>
                <p className="text-xs text-gray-400">Help improve the Cosmic RNG.</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {status === 'success_email' ? (
          <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in">
             <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-yellow-500/20">
                <Mail className="w-8 h-8 text-yellow-400" />
             </div>
             <h3 className="text-xl font-bold text-yellow-400">
                 Email Opened!
             </h3>
             <p className="text-gray-400">
                 Please hit send in your email app.
             </p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Contact Field */}
            <div>
                <label className="text-xs text-gray-400 font-bold ml-1 mb-1 block">Your Contact (Optional)</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Email or Discord ID..."
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 pl-10 text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Message Field */}
            <div>
                <label className="text-xs text-gray-400 font-bold ml-1 mb-1 block">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue, bug report, or suggestion here..."
                  className="w-full h-32 bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                />
            </div>

            {status === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-2 rounded">
                    <AlertCircle className="w-4 h-4" />
                    <span>Failed: {errorDetails}</span>
                </div>
            )}

            <div className="pt-2">
                <Button
                    onClick={handleEmailSubmit}
                    disabled={!message.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white flex justify-center"
                >
                    <Mail className="w-4 h-4 mr-2" /> Send via Email
                </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
