export function MemberAvatar({ name, large = false }) {
  const safeName = name || 'Socio';
  const initials = safeName.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  const palette = [...safeName].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
  return <span className={`avatar avatar--${palette}${large ? ' avatar--large' : ''}`} role="img" aria-label={`Avatar ilustrado de ${safeName}; no es una fotografía`}>{initials}</span>;
}
