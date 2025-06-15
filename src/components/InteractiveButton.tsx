
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface InteractiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'creator' | 'consumer';
  size?: 'small' | 'medium' | 'large' | 'hero';
  className?: string;
}

const InteractiveButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '',
  ...props 
}: InteractiveButtonProps) => {
  const baseClasses = "relative overflow-hidden group transition-all duration-500 transform hover:scale-105 active:scale-95";
  
  const variantClasses = {
    primary: "bg-white/20 text-white border-2 border-white/30 hover:bg-white hover:text-hooks-coral backdrop-blur-sm",
    outline: "bg-transparent text-white border-2 border-white/50 hover:bg-white/20 hover:border-white",
    ghost: "bg-transparent text-white/80 hover:text-white hover:bg-white/10 border-none",
    creator: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none hover:from-yellow-400 hover:to-orange-400 shadow-lg hover:shadow-xl",
    consumer: "bg-gradient-to-r from-pink-500 to-red-500 text-white border-none hover:from-pink-400 hover:to-red-400 shadow-lg hover:shadow-xl"
  };
  
  const sizeClasses = {
    small: "px-4 py-2 text-sm rounded-lg",
    medium: "px-6 py-3 text-base rounded-xl",
    large: "px-8 py-4 text-lg rounded-xl",
    hero: "px-12 py-6 text-xl rounded-2xl font-semibold"
  };

  return (
    <Button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        "hover-reveal-text",
        className
      )}
      {...props}
    >
      {/* Background animation layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      {/* Text content */}
      <span className="relative z-10 inline-block">
        {children}
      </span>
    </Button>
  );
};

export default InteractiveButton;
