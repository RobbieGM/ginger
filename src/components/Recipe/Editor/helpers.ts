import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_PUBLIC_PRESET_NAME } from 'global';
import { useState } from 'react';

interface ImageInfo {
  url: string;
  deleteToken: string;
}

export function useImageUpload() {
  const [state, setState] = useState({
    imageInfo: undefined as ImageInfo | undefined,
    error: undefined as string | undefined,
    uploading: false
  });
  return {
    imageURL: state?.imageInfo?.url,
    uploading: state.uploading,
    error: state.error,
    async upload(image: File) {
      setState(s => ({
        ...s,
        uploading: true,
        error: undefined
      }));
      const data = new FormData();
      data.set('file', image);
      try {
        if (state.imageInfo) {
          fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/delete_by_token?token=${state.imageInfo.deleteToken}`,
            {
              method: 'POST'
            }
          );
        }
        const result = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload?upload_preset=${CLOUDINARY_PUBLIC_PRESET_NAME}`,
          {
            method: 'POST',
            body: data
          }
        ).then(response => response.json());
        if (result.error && result.error.message) {
          setState(s => ({
            ...s,
            uploading: false,
            error: result.error.message
          }));
        } else {
          setState({
            imageInfo: {
              url: result.secure_url,
              deleteToken: result.delete_token
            },
            uploading: false,
            error: undefined
          });
        }
      } catch {
        setState(s => ({ ...s, uploading: false, error: 'Upload failed' }));
      }
    }
  };
}
