const ErrorMessage = ({ error }: { error?: string | null }) => {
    if (!error) {
      return null
    }
  
    return (
      <div
        className={`pt-2 font-semibold text-small-regular font-rubik ${
          error === "Login Successful" || error === "OTP Sent"
            ? "text-[#35b8ff]"
            : "text-rose-500"
        }`}
      >
        <span>{error}</span>
      </div>
    )
  }
  
  export default ErrorMessage
  