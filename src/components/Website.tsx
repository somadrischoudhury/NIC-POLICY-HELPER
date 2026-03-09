import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, GraduationCap, Heart, MessageSquare, Phone, Mail, MapPin, ChevronRight, Menu, X, Mic } from 'lucide-react';
import ChatInterface from './ChatInterface';
import VoiceAssistant from './VoiceAssistant';
import { generatePolicyImage } from '../services/imageService';

export default function Website() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const voiceAssistantRef = useRef<HTMLDivElement>(null);

  const scrollToVoice = () => {
    voiceAssistantRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadImages() {
      const img = await generatePolicyImage("A professional Indian advisor explaining complex documents to a curious person, warm lighting, clarity, trust, turquoise and peacock blue accents");
      if (img) setHeroImage(img);
    }
    loadImages();
  }, []);

  const features = [
    {
      title: "Clause Clarification",
      desc: "Confused about Section 3.9.5? We break down every sub-clause for you.",
      icon: Shield,
      color: "bg-turquoise"
    },
    {
      title: "Benefit Analysis",
      desc: "Understand exactly what is covered and what is excluded in your plan.",
      icon: Heart,
      color: "bg-peacock-blue"
    },
    {
      title: "No Sales, Just Help",
      desc: "Our bot is designed purely to help you understand, not to sell you anything.",
      icon: Users,
      color: "bg-turquoise"
    }
  ];

  const policies = [
    "National Mediclaim Policy",
    "National Parivar Mediclaim",
    "National Mediclaim Plus",
    "National Young India",
    "National Senior Citizen",
    "Arogya Sanjeevani",
    "National Super Top Up",
    "Vidyarthi Mediclaim"
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-peacock-blue rounded-xl flex items-center justify-center shadow-lg shadow-peacock-blue/20">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-peacock-blue">NICL HELP</span>
          </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#" className="hover:text-turquoise transition-colors">Home</a>
            <button onClick={scrollToVoice} className="hover:text-turquoise transition-colors">Voice Assistant</button>
            <a href="#" className="hover:text-turquoise transition-colors">FAQs</a>
            <a href="#" className="hover:text-turquoise transition-colors">Contact Support</a>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="bg-turquoise text-peacock-blue px-6 py-2.5 rounded-full font-bold hover:brightness-110 transition-all shadow-md shadow-turquoise/20"
            >
              Chat Support
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-row-2 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter mb-6 text-peacock-blue">
              CLEARING YOUR<br />
              <span className="text-turquoise">CONFUSIONS.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Health insurance policies can be complex. We are here to help you understand every clause, sub-limit, and benefit without any sales pressure.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={scrollToVoice}
                className="bg-peacock-blue text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                Talk to Assistant <Mic className="w-5 h-5 text-turquoise" />
              </button>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                Chat with Bot <MessageSquare className="w-5 h-5 text-peacock-blue" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative aspect-[4/3] rounded-[40px] overflow-hidden bg-slate-100 shadow-2xl border-4 border-turquoise/20"
          >
            {heroImage ? (
              <img src={heroImage} alt="Policy Clarification" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center animate-pulse bg-slate-200">
                <Shield className="w-20 h-20 text-slate-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-peacock-blue/20 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Voice Assistant Section */}
      <section ref={voiceAssistantRef} className="py-20 bg-slate-50/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tighter uppercase text-peacock-blue mb-4">Hands-Free Help</h2>
            <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
              Prefer talking? Use our real-time AI voice assistant to get instant answers to your policy questions.
            </p>
          </div>
          <VoiceAssistant />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 uppercase text-peacock-blue text-center">How We Help You</h2>
            <div className="w-24 h-2 bg-turquoise mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 group"
              >
                <div className={`${f.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg`}>
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-peacock-blue">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase mb-2 text-peacock-blue">Policy Knowledge Base</h2>
              <p className="text-slate-500">Select a policy to understand its specific terms.</p>
            </div>
            <a href="#" className="text-turquoise font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View all documents <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {policies.map((p, i) => (
              <div key={i} className="p-6 border border-slate-100 rounded-2xl hover:border-turquoise hover:bg-turquoise/5 transition-all cursor-pointer group">
                <h4 className="font-bold text-slate-800 group-hover:text-peacock-blue">{p}</h4>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Read Wordings <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-peacock-blue text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-turquoise rounded-xl flex items-center justify-center">
                <Shield className="text-peacock-blue w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter">NICL HELP</span>
            </div>
            <p className="text-slate-300 max-w-md leading-relaxed">
              This platform is dedicated to helping National Insurance policyholders understand their coverage better. We provide clarity, not sales pitches.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-turquoise">Support</h4>
            <div className="space-y-4 text-slate-300">
              <div className="flex items-center gap-3"><Phone className="w-4 h-4" /> 1800 345 0330</div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4" /> help@nic.co.in</div>
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4" /> Kolkata, India</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-turquoise">Resources</h4>
            <div className="space-y-4 text-slate-300">
              <a href="#" className="block hover:text-white transition-colors">Policy Documents</a>
              <a href="#" className="block hover:text-white transition-colors">Claim Process Guide</a>
              <a href="#" className="block hover:text-white transition-colors">Grievance Redressal</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/10 text-center text-slate-400 text-sm">
          © 2026 National Insurance Company Limited. Dedicated Support Portal.
        </div>
      </footer>

      {/* Floating Chat Bubble */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-20 right-0 w-[380px] h-[600px] max-h-[80vh] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <ChatInterface onClose={() => setIsChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isChatOpen ? 'bg-slate-900 rotate-90' : 'bg-turquoise hover:scale-110'
          }`}
        >
          {isChatOpen ? (
            <X className="text-white w-8 h-8" />
          ) : (
            <MessageSquare className="text-peacock-blue w-8 h-8" />
          )}
          {!isChatOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-peacock-blue rounded-full border-2 border-white animate-bounce" />
          )}
        </button>
      </div>
    </div>
  );
}
