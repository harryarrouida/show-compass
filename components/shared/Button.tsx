export const Button = ({ children, ...props }) => (
  <button
    className="group relative px-4 py-2 bg-zinc-800 hover:bg-zinc-700
               transition-all duration-300 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-zinc-500
               active:scale-95"
    {...props}
  >
    <span className="relative z-10 flex items-center gap-2">
      {children}
    </span>
    <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 to-zinc-600 
                    opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
  </button>
);
