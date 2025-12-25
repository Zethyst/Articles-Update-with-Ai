import { type ReactNode } from "react";

interface SectionHeaderProps {
  variant: "laravel" | "nodejs";
  title: string;
  subtitle: string;
  icon: ReactNode;
}

const SectionHeader = ({ variant, title, subtitle, icon }: SectionHeaderProps) => {
  const isLaravel = variant === "laravel";

  return (
    <div className="flex items-center gap-4 mb-8">
      <div
        className={`
          flex items-center justify-center w-16 h-16 rounded-2xl
          ${isLaravel 
            ? "bg-red-600" 
            : "bg-green-700"
          }
        `}
      >
        {icon}
      </div>
      <div>
        <h2
          className={`
            text-3xl font-bold
            ${isLaravel ? "text-red-600" : "text-green-700"}
          `}
        >
          {title}
        </h2>
        <p className="text-blue-600/70 text-base">{subtitle}</p>
      </div>
    </div>
  );
};

export default SectionHeader;