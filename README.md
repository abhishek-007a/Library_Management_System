# 📚 LibroScan - Smart Library Management System

A modern, full-featured Library Management System built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Supports dual-mode book cataloging via **Barcode / ISBN Camera & Hardware Scanning** and **Manual Entry**, circulation management (Issue & Return), member tracking, and barcode label printing.

---

## 🔐 Role-Based Access Control (Admin vs Public Guests)

The system now features a dedicated **Admin & Librarian Authentication Panel**:

- **Public / Guest Users**:
  - Can search and browse the full catalog.
  - Can check real-time physical availability (number of copies on shelf, shelf rack, synopsis, author, genre).
  - Restricted from adding, editing, or deleting books, issuing/returning loans, viewing member records, or modifying database settings.
- **Admin / Librarian**:
  - Has full privileged access to:
    - **Add Books** (via Barcode Scan or Manual Entry)
    - **Edit** any book details
    - **Delete** books from inventory
    - **Circulation Desk** (Check-out & Check-in / Return)
    - **Member Management**
    - **Barcode Sticker Printing**
    - **Supabase Cloud Settings**
  - **Default Admin Credentials**:
    - **Username**: `admin`
    - **Password**: `admin123`
  - *Tip: Admins can change their username and password anytime via the key icon in the top navigation!*

---

## ✨ Features

### 1. 📷 Dual-Mode Book Cataloging
- **Scan Barcode (Camera)**: Point webcam or mobile camera at the book's ISBN barcode (EAN-13, EAN-8, UPC-A, Code 128) to auto-detect the ISBN.
- **Upload Barcode Photo**: Drag-and-drop or upload a photograph of any book barcode.
- **Hardware / USB Barcode Scanner**: Connect any USB or Bluetooth handheld barcode reader; automatically captures keystroke streams.
- **Auto-Fetch Online Metadata**: Queries **Open Library API** with fallback to **Google Books API** to automatically retrieve:
  - Title, Subtitle, Description
  - Author(s) & Publisher
  - Publication Year & Page Count
  - Genres / Categories
  - High-resolution Cover Art
- **Manual Book Entry**: Dedicated full manual entry form to add books from scratch or modify any auto-fetched details.

### 2. ⚡ Supabase Cloud Database Integration
- Full PostgreSQL schema provided in [`supabase/schema.sql`](file:///c:/Users/hp/OneDrive/Desktop/Anti_Gravity/supabase/schema.sql) with tables:
  - `books`: ISBN, title, author, copies, shelf location, cover, status
  - `borrowers`: Member ID, name, email, phone, membership type
  - `loans`: Book ID, borrower ID, borrow date, due date, return date, status
- Built-in Supabase Configuration modal with **Test Connection** verification.
- **Seamless Local Demo Fallback**: Automatically falls back to local storage with pre-seeded classic books so you can immediately test the scanner and catalog even before linking a Supabase account!
- **One-Click Local to Supabase Sync**: Push your local/scanned inventory into Supabase with one button.

### 3. 🔄 Circulation Desk (Issue & Return)
- **Check-out / Issue**: Select or scan a book, select member, choose loan duration (7, 14, 21, 30 days), and confirm checkout. Automatically decrements available copies.
- **Check-in / Return**: 1-click return or scan returned book's barcode to instantly mark as returned and return copy to shelf inventory.
- **Overdue Detection**: Highlights overdue books with alert badges.

### 4. 🖨️ Barcode Label Printing Studio
- Generate crisp, scannable Code128 / EAN-13 barcodes for any book.
- Configurable formats: Standard Spine Labels (2" x 1"), Detailed Catalog Labels (3" x 2"), or Minimalist Barcodes.
- Print individual labels or batch print for entire sections with standard `@media print` layout.

### 5. 👥 Member / Borrower Management
- Track library patrons (Students, Faculty, Public members).
- Automatically generated Member IDs with scannable membership card barcodes.

---

## 🚀 Getting Started

### 1. Installation

Dependencies are already installed. If running on a new machine:
```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production

```bash
npm run build
npm run preview
```

---

## 🌐 Deploying to Render (100% Free)

This app is a frontend Vite Single Page Application and can be hosted for **free** on Render as a **Static Site**:

### Method A: Automatic Deployment using Blueprint (`render.yaml`)
1. Push this project to a GitHub repository.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** &rarr; **Blueprint**.
3. Select your repository. Render will automatically read [`render.yaml`](file:///c:/Users/hp/OneDrive/Desktop/Anti_Gravity/render.yaml) and configure the build command, output directory (`dist`), and SPA routing rules!

### Method B: Manual Setup on Render
1. In [Render Dashboard](https://dashboard.render.com), click **New +** &rarr; **Static Site**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `libroscan-library-system`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Redirects/Rewrites**:
   - Add rule: `/*` &rarr; `/index.html` (Type: **Rewrite**)
5. Under **Environment Variables** (Optional, can also configure in UI):
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
6. Click **Create Static Site**!

---

## 🗄️ Setting Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In your Supabase Dashboard:
   - Navigate to **Project Settings &rarr; API** and copy:
     - **Project URL**
     - **anon (public) key**
3. Open the **SQL Editor** tab in Supabase:
   - Paste the contents of [`supabase/schema.sql`](file:///c:/Users/hp/OneDrive/Desktop/Anti_Gravity/supabase/schema.sql).
   - Click **Run** to generate the tables, indexes, RLS policies, and sample records.
4. In the LibroScan app:
   - Click the **Database / Settings** button in the top right.
   - Enter your **Project URL** and **Anon Key**.
   - Click **Test Connection** &rarr; **Save & Connect**.
   - Optional: Click **Sync to Supabase** to upload any locally added books to your cloud database!

Alternatively, create a `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔍 Sample ISBNs to Test Barcode Scanning & Auto-Lookup

You can test manual ISBN lookup or print these barcodes to test your camera/scanner:

| Title | ISBN-13 | Genre |
| :--- | :--- | :--- |
| **Clean Code** | `9780132350884` | Technology |
| **1984** | `9780451524935` | Dystopian Fiction |
| **To Kill a Mockingbird** | `9780061120084` | Classic Literature |
| **The Pragmatic Programmer** | `9780201616224` | Software Engineering |
| **Sapiens** | `9780062316097` | History |
| **Atomic Habits** | `9780735211292` | Self-Help |
| **The Great Gatsby** | `9780743273565` | Classic Literature |
