import React, { useEffect, useState } from 'react';
import { Quote } from '@/lib/quotes';

interface QuoteModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  isMonthlyCheckpoint?: boolean;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ 
  quote, 
  isOpen, 
  onClose, 
  streak,
  isMonthlyCheckpoint = false
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    try {
      onClose();
    } catch (error) {
      console.error('Error in modal close handler:', error);
      // Fallback navigation if the onClose handler fails
      window.location.href = '/';
    }
  };

  // Wenn das Modal nicht sichtbar und nicht geöffnet ist, nichts rendern
  if (!isVisible && !isOpen) {
    return null;
  }

  // Wenn kein Zitat verfügbar ist, einen Fallback anzeigen
  if (!quote) {
    return (
      <div 
        className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      >
        <div 
          className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-transform duration-300 ${
            isOpen ? 'scale-100' : 'scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary bg-opacity-20 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800">Well done!</h3>
            
            <div className="mt-2 mb-4">
              <span className="text-primary font-bold text-lg">{streak} Day Streak! 🔥</span>
              {isMonthlyCheckpoint && (
                <div className="mt-1 text-green-600 font-semibold">
                  Monthly milestone reached! 🏆
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <button
              className="btn-primary"
              onClick={handleClose}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary bg-opacity-20 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800">Well done!</h3>
          
          <div className="mt-2 mb-4">
            <span className="text-primary font-bold text-lg">{streak} Day Streak! 🔥</span>
            {isMonthlyCheckpoint && (
              <div className="mt-1 text-green-600 font-semibold">
                Monthly milestone reached! 🏆
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-800 italic text-center">"{quote.text}"</p>
          <p className="text-right mt-2 text-gray-600">— {quote.author}</p>
        </div>
        
        <div className="text-center">
          <button
            className="btn-primary"
            onClick={handleClose}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
