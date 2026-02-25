
export const compressImage = async (file: File, type: 'logo' | 'bg' | 'userAvatar' | 'lockBg' | 'favicon'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Default max dimensions
        let MAX_WIDTH = 1920;
        let MAX_HEIGHT = 1920;

        // Stricter limits for LocalStorage usage
        if (type === 'logo') { MAX_WIDTH = 300; MAX_HEIGHT = 300; }
        if (type === 'favicon') { MAX_WIDTH = 64; MAX_HEIGHT = 64; }
        if (type === 'userAvatar') { MAX_WIDTH = 300; MAX_HEIGHT = 300; }
        
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
        }

        // Clear context for transparency support
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const mimeType = (type === 'logo' || type === 'favicon' || type === 'userAvatar') ? 'image/png' : 'image/jpeg';
        let quality = 0.9;
        
        let dataUrl = canvas.toDataURL(mimeType, quality);
        
        // Strict limits to prevent QuotaExceededError
        // Backgrounds: 1.2MB (approx 1.6MB string)
        // Others: 150KB (approx 200KB string)
        const limit = (type === 'bg' || type === 'lockBg') ? 1.2 * 1024 * 1024 : 150 * 1024;
        
        while (dataUrl.length > limit && quality > 0.1) {
           quality -= 0.1;
           dataUrl = canvas.toDataURL(mimeType, quality);
        }
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
