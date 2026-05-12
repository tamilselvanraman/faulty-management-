# EduCore ERP - Faculty & Management System

EduCore is a modern, high-performance ERP (Enterprise Resource Planning) system designed for educational institutions. It streamlines the management of faculty, students, committees, and academic schedules with a focus on visual excellence and user experience.

![EduCore Dashboard](https://github.com/TamilselvanRaman/faulty-Management-/raw/main/public/dashboard-preview.png)

## 🚀 Features

### 🏛️ Committee Management
- **Dynamic Oversight:** Track and manage various academic and administrative committees.
- **Categorization:** Color-coded categories for easy identification (Technical, Cultural, Sports, etc.).
- **Member Tracking:** Manage committee members, roles, and status.
- **Filtering:** Powerful search and filter capabilities by category and status.

### 📅 Event Management
- **Integrated Calendar:** Powered by FullCalendar for monthly, weekly, and daily views.
- **Scheduling:** Effortlessly plan and coordinate institution-wide events.
- **Real-time Updates:** Stay informed with toast notifications and dynamic UI updates.

### 👨‍🏫 Faculty & Student Portals
- **Directory:** Comprehensive directories for faculty members and students.
- **Profile Management:** Detailed views for performance tracking and administrative records.
- **Rankings:** Integrated ranking systems for academic and extracurricular achievements.

### 📊 Advanced Analytics
- **Data Visualization:** Interactive charts and dashboards powered by Recharts.
- **Task Tracking:** Kanban-style task management for administrative staff.
- **Timetable Management:** Dynamic scheduling for classes and lecture halls.

## 🛠️ Technology Stack

- **Core:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend/Database:** [Supabase](https://supabase.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/) & [Material Symbols](https://fonts.google.com/icons)
- **Data Handling:** [Zod](https://zod.dev/) (Validation), [PapaParse](https://www.papaparse.com/) (CSV)
- **UI Components:** Custom glassmorphic components with dynamic themes.

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TamilselvanRaman/faulty-Management-.git
   cd faulty-Management-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by [Tamilselvan Raman](https://github.com/TamilselvanRaman)
