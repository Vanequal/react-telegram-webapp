export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  export const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('doc')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    return '📎';
  };
  
  export const isImageFile = (file) => {
    return file.type?.startsWith('image/') || 
           ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.extension?.toLowerCase());
  };
  
  export const isVideoFile = (file) => {
    return file.type?.startsWith('video/') || 
           ['mp4', 'webm', 'ogg'].includes(file.extension?.toLowerCase());
  };