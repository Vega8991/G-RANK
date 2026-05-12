import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
    return (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
            <motion.div
                className="relative z-10 rounded-2xl p-6 max-w-sm w-full border border-red-500/20"
                style={{ background: "linear-gradient(135deg,rgba(20,5,5,0.98),rgba(15,5,5,0.95))" }}
                initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">Confirm deletion</p>
                        <p className="text-xs text-white/40">This action cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-white/60 mb-5">{message}</p>
                <div className="flex gap-2">
                    <button onClick={onCancel}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/20">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 transition-all">
                        Delete
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
