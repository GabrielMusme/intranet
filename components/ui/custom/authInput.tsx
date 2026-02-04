// LoginInput is a custom input component for login forms
// It accepts all standard input attributes and an optional error message
type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  errorMessage?: string;
};

export function AuthInput({
  errorMessage,
  className,
  ...inputProps
}: AuthInputProps) {
  const inputType = inputProps.type === "submit" ? "text-white bg-gradient-to-br from-[#7cadb3] to-[#275273] hover:from-[#86b7bd] hover:to-[#315c7d] cursor-pointer" : "bg-white/30 hover:bg-white/50 focus:bg-white/50";

  return (
    <div className="mb-2 relative">
      <input
        {...inputProps}
        className={`w-full outline-none py-2 px-4 text-xl text-center ${inputType} ${className ?? ""}`}
        style={{
          border: "1px solid #242c37",
          font: "inherit",
          borderRadius: "999px",
          ...(inputProps.style || {}),
        }}
      />
      <p
        className="text-red-500 text-[10px] font-semibold mt-1 min-h-[16px] max-w-full text-center break-words"
        style={{
          maxWidth: "100%", // Limita el ancho del mensaje de error al ancho del contenedor
          wordWrap: "break-word", // Permite que las palabras largas se dividan en varias líneas
        }}
      >
        {errorMessage}
      </p>
    </div>
  );
};