import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

const Toast = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 right-6 z-40 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 rounded-xl bg-gray-900 text-white px-4 py-3 shadow-lg pointer-events-auto">
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" strokeWidth={1.5} />
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-1 text-gray-400 hover:text-white transition-colors cursor-pointer">
          <X size={15} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default Toast;