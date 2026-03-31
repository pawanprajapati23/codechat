import './Input.css';

export default function Input({ 
  label, 
  error, 
  icon, 
  className = '', 
  containerClass = '',
  ...props 
}) {
  return (
    <div className={`input-container ${containerClass}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input 
          className={`input ${icon ? 'has-icon' : ''} ${error ? 'error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
