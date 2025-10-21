import React from 'react';
import styles from './Button.module.css';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  block = false,
  disabled = false,
  icon,
  className = '',
  ...props 
}) => {
  const buttonClass = `${styles.button} ${styles[`button-${variant}`]} ${styles[`button-${size}`]} ${block ? styles['button-block'] : ''} ${className}`;

  return (
    <button 
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
