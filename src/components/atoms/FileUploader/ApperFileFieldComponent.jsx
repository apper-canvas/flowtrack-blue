import { useState, useEffect, useRef, useMemo } from 'react';

const ApperFileFieldComponent = ({ elementId, config }) => {
  // State management for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Update elementIdRef when elementId changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoized existingFiles to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    if (!config.existingFiles || !Array.isArray(config.existingFiles)) {
      return [];
    }
    
    // Return empty array if no files to prevent unnecessary operations
    if (config.existingFiles.length === 0) {
      return [];
    }
    
    // Detect actual changes by comparing length and first file's ID
    const currentFiles = existingFilesRef.current;
    if (currentFiles.length !== config.existingFiles.length) {
      return config.existingFiles;
    }
    
    if (config.existingFiles.length > 0 && currentFiles.length > 0) {
      const currentFirstId = currentFiles[0]?.id || currentFiles[0]?.Id;
      const newFirstId = config.existingFiles[0]?.id || config.existingFiles[0]?.Id;
      if (currentFirstId !== newFirstId) {
        return config.existingFiles;
      }
    }
    
    return currentFiles;
  }, [config.existingFiles]);

  // Initial Mount Effect
  useEffect(() => {
    let mounted = true;
    
    const initializeSDK = async () => {
      try {
        // Initialize ApperSDK with 50 attempts × 100ms = 5 seconds timeout
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts && mounted) {
          if (window.ApperSDK) {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }
        
        if (!mounted) return;
        
        const { ApperFileUploader } = window.ApperSDK;
        
        // Set unique element ID
        elementIdRef.current = elementId;
        
        // Mount the file field with full config
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });
        
        if (mounted) {
          mountedRef.current = true;
          existingFilesRef.current = memoizedExistingFiles;
          setIsReady(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error initializing ApperFileFieldComponent:', err);
          setError(err.message);
          setIsReady(false);
        }
      }
    };
    
    initializeSDK();
    
    // Cleanup on component destruction
    return () => {
      mounted = false;
      if (mountedRef.current) {
        try {
          const { ApperFileUploader } = window.ApperSDK || {};
          if (ApperFileUploader) {
            ApperFileUploader.FileField.unmount(elementIdRef.current);
          }
        } catch (err) {
          console.error('Error unmounting ApperFileFieldComponent:', err);
        }
        mountedRef.current = false;
        existingFilesRef.current = [];
      }
    };
  }, [elementId, config.fieldKey, config.tableName, config.apperProjectId, config.apperPublicKey]);

  // File Update Effect
  useEffect(() => {
    if (!isReady || !window.ApperSDK || !config.fieldKey) {
      return;
    }
    
    // Deep equality check to prevent unnecessary updates
    const currentFiles = existingFilesRef.current;
    const newFiles = memoizedExistingFiles;
    
    if (JSON.stringify(currentFiles) === JSON.stringify(newFiles)) {
      return;
    }
    
    const updateFiles = async () => {
      try {
        const { ApperFileUploader } = window.ApperSDK;
        
        // Format detection: check for .Id vs .id property
        let filesToUpdate = newFiles;
        if (newFiles.length > 0 && newFiles[0].Id !== undefined) {
          // Convert from API format to UI format
          filesToUpdate = ApperFileUploader.toUIFormat(newFiles);
        }
        
        // Update files or clear field based on content
        if (filesToUpdate.length > 0) {
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
        } else {
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }
        
        existingFilesRef.current = newFiles;
      } catch (err) {
        console.error('Error updating files:', err);
        setError(err.message);
      }
    };
    
    updateFiles();
  }, [memoizedExistingFiles, isReady, config.fieldKey]);

  // Error UI
  if (error) {
    return (
      <div className="p-4 border border-error-200 rounded-lg bg-error-50">
        <div className="flex items-center space-x-2 text-error-600">
          <span className="text-sm font-medium">File Upload Error</span>
        </div>
        <p className="text-error-600 text-sm mt-1">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-3 py-1 bg-error-500 text-white text-sm rounded hover:bg-error-600"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main container with unique ID */}
      <div id={elementId} className="min-h-[100px]">
        {/* Loading UI */}
        {!isReady && (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg">
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-slate-600">Loading file uploader...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;