import { PayBlock } from "./components/Pay";
import { VerifyBlock } from "./components/Verify";
import { AuthProvider } from "./context/AuthContext";
import LoginControls from "./components/Auth/LoginControls";

export default function App() {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
        <div className="absolute top-4 right-4">
          <LoginControls />
        </div>
        <VerifyBlock />
        <PayBlock />
      </main>
    </AuthProvider>
  );
}
