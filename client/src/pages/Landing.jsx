import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { CheckCircle, LayoutDashboard, Users, BarChart2, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">N</span>
            </div>
            <span className="text-slate-900 font-bold text-xl tracking-tight">NOVA</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] max-w-5xl opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8 border border-indigo-100 animate-fade-in">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>NOVA 1.0 is now live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Plan smarter.<br className="hidden md:block" />
            Collaborate better.<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">
              Deliver faster.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            The ultimate productivity platform for modern teams. Manage projects, track tasks, and collaborate seamlessly in one beautiful workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg h-14 px-8 rounded-xl shadow-lg shadow-indigo-200">
                Start for free
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full text-lg h-14 px-8 rounded-xl border-2">
                Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything your team needs</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Stop juggling multiple tools. NOVA brings everything together in a single, intuitive interface.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Project Tracking</h3>
              <p className="text-slate-600">Visualize progress with Kanban boards, list views, and real-time status updates.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Team Collaboration</h3>
              <p className="text-slate-600">Comment on tasks, tag teammates, and keep everyone aligned in context.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Actionable Analytics</h3>
              <p className="text-slate-600">Understand team productivity and project health with beautiful dashboards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200 text-center text-slate-500">
        <p>© 2026 NOVA Productivity Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
