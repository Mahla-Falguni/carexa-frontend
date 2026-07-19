export const BACKEND_URL = "https://carexa-backend.vercel.app";

// SVG Data URIs for clean, modern, reliable fallbacks
export const FALLBACK_HOSPITAL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='none'><rect width='400' height='300' fill='%23F1F5F9'/><rect x='150' y='75' width='100' height='150' rx='8' fill='%230EA5E9' opacity='0.15'/><path d='M185 130H215M200 115V145' stroke='%230284C7' stroke-width='8' stroke-linecap='round'/><rect x='170' y='170' width='60' height='55' fill='%230284C7' opacity='0.3'/><circle cx='200' cy='55' r='12' fill='%230284C7'/></svg>";

export const FALLBACK_DOCTOR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200' fill='none'><rect width='200' height='200' rx='100' fill='%23E0F2FE'/><circle cx='100' cy='75' r='35' fill='%230284C7'/><path d='M45 165C45 130 70 120 100 120C130 120 155 130 155 165' stroke='%230284C7' stroke-width='16' stroke-linecap='round'/></svg>";

export const FALLBACK_USER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200' fill='none'><rect width='200' height='200' rx='100' fill='%23F3F4F6'/><circle cx='100' cy='75' r='35' fill='%239CA3AF'/><path d='M45 165C45 130 70 120 100 120C130 120 155 130 155 165' stroke='%239CA3AF' stroke-width='16' stroke-linecap='round'/></svg>";

/**
 * Returns full image URL for hospital, doctor, or user profile image.
 */
export function getImageUrl(imagePath, type = 'hospital') {
  if (!imagePath) {
    if (type === 'doctor') return FALLBACK_DOCTOR;
    if (type === 'user') return FALLBACK_USER;
    return FALLBACK_HOSPITAL;
  }

  if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:'))) {
    return imagePath;
  }

  return `${BACKEND_URL}/uploads/${imagePath}`;
}

/**
 * Handles img onError event safely without infinite loops
 */
export function handleImageError(e, type = 'hospital') {
  let fallback = FALLBACK_HOSPITAL;
  if (type === 'doctor') fallback = FALLBACK_DOCTOR;
  if (type === 'user') fallback = FALLBACK_USER;

  if (e.target && e.target.src !== fallback) {
    e.target.onerror = null;
    e.target.src = fallback;
    if (e.target.style.display === 'none') {
      e.target.style.display = 'block';
    }
  }
}
