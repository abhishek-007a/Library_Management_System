/**
 * Robust, cross-browser printing utility that prints content via an isolated iframe.
 * Prevents the classic browser bug where modal dialogs with fixed positioning,
 * overflow:hidden, or max-h-[95vh] cause window.print() to generate BLANK PDF pages.
 */
export function printHtmlViaIframe(htmlContent: string, title: string = 'LibroScan Report'): void {
  try {
    // Remove any existing print iframe
    const existingIframe = document.getElementById('libroscan-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'libroscan-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 15mm 15mm;
            }
            *, *::before, *::after {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 11px;
              line-height: 1.4;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 14px;
            }
            th {
              background: #f1f5f9;
              color: #334155;
              font-size: 10px;
              text-transform: uppercase;
              font-weight: 700;
              padding: 7px 8px;
              border: 1px solid #cbd5e1;
              text-align: left;
            }
            td {
              padding: 7px 8px;
              border: 1px solid #e2e8f0;
              vertical-align: top;
            }
            tr:nth-child(even) td {
              background-color: #f8fafc;
            }
            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .header-title h1 {
              font-size: 18px;
              font-weight: 800;
              margin: 0 0 4px 0;
              color: #0f172a;
              letter-spacing: -0.3px;
            }
            .header-title p {
              margin: 0;
              color: #64748b;
              font-size: 11px;
            }
            .header-meta {
              text-align: right;
              font-size: 11px;
              color: #64748b;
            }
            .header-meta strong {
              color: #0f172a;
            }
            .meta-grid {
              display: flex;
              gap: 10px;
              margin-top: 12px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
            }
            .meta-box {
              flex: 1;
              padding: 8px 10px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
            }
            .meta-box.highlight {
              background: #ecfdf5;
              border-color: #a7f3d0;
            }
            .meta-label {
              font-size: 9px;
              text-transform: uppercase;
              font-weight: 700;
              color: #64748b;
              margin: 0 0 2px 0;
            }
            .meta-value {
              font-size: 14px;
              font-weight: 800;
              margin: 0;
              color: #0f172a;
            }
            .meta-box.highlight .meta-value {
              color: #047857;
            }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
            }
            .footer {
              margin-top: 24px;
              padding-top: 10px;
              border-top: 1px solid #cbd5e1;
              font-size: 10px;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    doc.close();

    // Allow iframe styles to calculate before firing print dialog
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Iframe print failed, falling back to window.print():', e);
        window.print();
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 3000);
      }
    }, 300);
  } catch (err) {
    console.warn('printHtmlViaIframe error, falling back:', err);
    window.print();
  }
}
