import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";

interface AdminToastProps {
    message: string;
    ok: boolean;
    onDone: () => void;
}

export default function AdminToast({ message, ok, onDone }: AdminToastProps) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <motion.div
            className={`fixed bottom-6 right-6 z-[90] flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl ${ok ? "text-green-300" : "text-red-300"}`}
            style={ok
                ? { background: "rgba(10,30,15,0.95)", border: "1px solid rgba(34,197,94,0.3)" }
                : { background: "rgba(30,5,5,0.95)",   border: "1px solid rgba(239,68,68,0.3)"  }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{   opacity: 0, y: 20,  scale: 0.9 }}
        >
            {ok ? <Check size={15} /> : <AlertTriangle size={15} />}
            {message}
        </motion.div>
    );
}
