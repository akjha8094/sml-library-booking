import React from 'react';
import styles from './Input.module.css';

const Input = ({ 
  label, 
  type = 'text', 
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  disabled = false,
  icon,
  className = '',
  ...props 
}) => {
  const inputClass = `${styles.input} ${error ? styles['input-error'] : ''} ${icon ? styles['input-with-icon'] : ''} ${className}`;

  return (
    <div className={styles['input-group']}>
      {label && (
        <label className={`${styles.label} ${required ? styles['label-required'] : ''}`}>
          {label}
        </label>
      )}
      
      {icon ? (
        <div className={styles['input-icon-wrapper']}>
          <span className={styles['input-icon']}>{icon}</span>
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={inputClass}
            {...props}
          />
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClass}
          {...props}
        />
      )}
      
      {error && <p className={styles['error-message']}>{error}</p>}
      {helperText && !error && <p className={styles['helper-text']}>{helperText}</p>}
    </div>
  );
};

export const Textarea = ({ 
  label, 
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  disabled = false,
  rows = 4,
  className = '',
  ...props 
}) => {
  const textareaClass = `${styles.input} ${error ? styles['input-error'] : ''} ${className}`;

  return (
    <div className={styles['input-group']}>
      {label && (
        <label className={`${styles.label} ${required ? styles['label-required'] : ''}`}>
          {label}
        </label>
      )}
      
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={textareaClass}
        {...props}
      />
      
      {error && <p className={styles['error-message']}>{error}</p>}
      {helperText && !error && <p className={styles['helper-text']}>{helperText}</p>}
    </div>
  );
};

export const Select = ({ 
  label, 
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
  helperText,
  disabled = false,
  placeholder = 'Select...',
  className = '',
  ...props 
}) => {
  const selectClass = `${styles.input} ${error ? styles['input-error'] : ''} ${className}`;

  return (
    <div className={styles['input-group']}>
      {label && (
        <label className={`${styles.label} ${required ? styles['label-required'] : ''}`}>
          {label}
        </label>
      )}
      
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={selectClass}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      
      {error && <p className={styles['error-message']}>{error}</p>}
      {helperText && !error && <p className={styles['helper-text']}>{helperText}</p>}
    </div>
  );
};

export default Input;
