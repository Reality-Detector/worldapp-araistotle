import { useAuth } from "../../context/AuthContext";

export const LoginControls = () => {
  const { user, login, logout } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">Signed in as {user.name || user.sub}</span>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={() => void logout()}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded"
        onClick={() => void login()}
      >
        Sign in with World ID
      </button>
    </div>
  );
};

export default LoginControls;
