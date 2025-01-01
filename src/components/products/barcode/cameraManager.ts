export const initializeCamera = async (videoRef: React.RefObject<HTMLVideoElement>) => {
  try {
    console.log('Initializing camera...');
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      } 
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      return stream;
    }
    return null;
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw error;
  }
};

export const captureFrame = (video: HTMLVideoElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture frame'));
        }
      },
      'image/jpeg',
      0.8
    );
  });
};