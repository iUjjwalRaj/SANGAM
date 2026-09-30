import React from 'react';

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero';

export interface SangamLogoProps {
  size?: LogoSize;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Accessible alt text.
   * If not provided or if the logo is used beside text like "SANGAM",
   * it will be treated as decorative (aria-hidden="true") to prevent screen reader redundancy.
   */
  alt?: string;
  isDecorative?: boolean;
}

/**
 * Official SANGAM brand mark presentation component.
 * Uses canonical `/logo/sangamIcon.png` as the single source.
 * Renders directly as a transparent PNG mark with no rectangular border, background, or badge container.
 * Adapts seamlessly across Dark, OLED, and Light themes via CSS custom properties.
 */
export const SangamLogo: React.FC<SangamLogoProps> = ({
  size = 'md',
  className = '',
  style,
  alt = 'SANGAM',
  isDecorative = true,
}) => {
  return (
    <img
      src="/logo/sangamIcon.png"
      alt={isDecorative ? '' : alt}
      className={`sangam-logo size-${size} ${className}`.trim()}
      style={style}
      aria-hidden={isDecorative ? true : undefined}
      loading="eager"
      decoding="async"
    />
  );
};
