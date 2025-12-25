import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface UpdateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const UpdateButton = ({ onClick, isLoading, disabled }: UpdateButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="
        relative overflow-hidden
        bg-green-600 hover:bg-green-700 text-white
        font-semibold px-8 py-6 text-base rounded-lg
        shadow-lg hover:shadow-xl
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      <RefreshCw
        className={`w-5 h-5 mr-2 ${isLoading ? "animate-spin" : ""}`}
      />
      {isLoading ? "Updating Articles..." : "Update Articles"}
    </Button>
  );
};

export default UpdateButton;