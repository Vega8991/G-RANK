export default function Spinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
            <div className="w-10 h-10 rounded-full border-2 border-[#dc143c]/30 border-t-[#dc143c] animate-spin" />
        </div>
    );
}
