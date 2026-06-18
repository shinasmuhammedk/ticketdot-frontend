import React from 'react';
import './Input.css';

const Input = React.forwardRef(({ 
  label, 
  error, 
  icon: Icon,
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className={`input-container ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <Icon className="input-icon" size={20} />}
        <input 
          ref={ref}
          className={`input-field ${Icon ? 'with-icon' : ''} ${error ? 'has-error' : ''}`}
          {...props} 
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
