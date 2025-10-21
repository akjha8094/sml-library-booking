import React from 'react';
import styles from './Card.module.css';

const Card = ({ 
  children, 
  hover = false, 
  clickable = false,
  onClick,
  className = '',
  ...props 
}) => {
  const cardClass = `${styles.card} ${hover ? styles['card-hover'] : ''} ${clickable ? styles['card-clickable'] : ''} ${className}`;

  return (
    <div className={cardClass} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '' }) => (
  <div className={`${styles['card-header']} ${className}`}>{children}</div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 className={`${styles['card-title']} ${className}`}>{children}</h3>
);

Card.Subtitle = ({ children, className = '' }) => (
  <p className={`${styles['card-subtitle']} ${className}`}>{children}</p>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`${styles['card-body']} ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`${styles['card-footer']} ${className}`}>{children}</div>
);

export default Card;
