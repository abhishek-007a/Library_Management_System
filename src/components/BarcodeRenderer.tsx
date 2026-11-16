import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  format?: 'CODE128' | 'EAN13' | 'pharmacode';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
  lineColor?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = 'CODE128',
  width = 1.6,
  height = 50,
  displayValue = true,
  fontSize = 12,
  className = '',
  lineColor = '#0f172a'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      // If user requested EAN13 but value is not exactly 12 or 13 digits, fallback to CODE128
      let resolvedFormat = format;
      const cleanValue = value.replace(/[^0-9]/g, '');
      if (format === 'EAN13' && cleanValue.length !== 13 && cleanValue.length !== 12) {
        resolvedFormat = 'CODE128';
      }

      JsBarcode(svgRef.current, value, {
        format: resolvedFormat,
        width,
        height,
        displayValue,
        fontSize,
        font: 'JetBrains Mono',
        textMargin: 4,
        margin: 6,
        background: 'transparent',
        lineColor,
        valid: () => {}
      });
    } catch {
      // If format throws error, fallback to CODE128
      try {
        if (svgRef.current) {
          JsBarcode(svgRef.current, value, {
            format: 'CODE128',
            width,
            height,
            displayValue,
            fontSize,
            lineColor
          });
        }
      } catch (inner) {
        console.warn('Barcode generation failed:', inner);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, lineColor]);

  if (!value) return null;

  return (
    <div className={`inline-flex flex-col items-center bg-white p-1.5 rounded border border-slate-200 shadow-sm ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto overflow-hidden" />
    </div>
  );
};
