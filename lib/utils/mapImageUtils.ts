/**
 * Converts a map name to camelCase format
 * Example: "New Gridania" -> "newGridania"
 */
export function toCamelCase(text: string): string {
    return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
}

/**
 * Compresses an image file to WebP format
 */
export async function compressImageToWebP(
    file: File,
    quality: number = 0.75,
    maxWidth: number = 2048,
    maxHeight: number = 2048
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            try {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/webp',
                    quality
                );
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Validates if a file is a valid image
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (!validTypes.includes(file.type)) {
        return {
            isValid: false,
            error: 'Format de fichier non supporté. Utilisez JPEG, PNG ou WebP.'
        };
    }

    if (file.size > maxSize) {
        return {
            isValid: false,
            error: 'Le fichier est trop volumineux. Taille maximale: 20MB.'
        };
    }

    return { isValid: true };
}