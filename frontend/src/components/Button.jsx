import './Button.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  disabled, 
  onClick, 
  className = '',
  ...props 
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
