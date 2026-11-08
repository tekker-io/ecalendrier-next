import { EmailLoginForm } from "./email-login-form";
import { GoogleButton } from "./google-button";

export function LoginOptions() {
  return (
    <div className="w-full max-w-xs flex flex-col gap-3">
      <GoogleButton />
      <div className="flex items-center gap-3 text-sm opacity-80">
        <div className="flex-1 h-px bg-white/50" />
        ou
        <div className="flex-1 h-px bg-white/50" />
      </div>
      <EmailLoginForm />
    </div>
  );
}
