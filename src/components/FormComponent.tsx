import { useState } from "react";

export const FormComponent: React.FC<{
  onSubmitClick: (username: string) => void;
  onGoCom1Click: () => void;
}> = ({ onSubmitClick, onGoCom1Click }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!username.trim()) {
      setError("Nhập tên đi bạn êiii!");
      return;
    }
    setError("");
    onSubmitClick(username);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError(""); // Clear error when user starts typing
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="mb-5">
        <input
          type="text"
          id="username"
          className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5"
          placeholder="Min Le..."
          value={username}
          onChange={handleInputChange}
          required
        />
        {error && <p className="text-red-500 font-primaryMedium text-sm mt-2">{error}</p>}
      </div>
      <div className="flex space-x-4 items-center justify-center">
        <button
          onClick={handleSubmit}
          className="text-black bg-green-500 hover:bg-green-600 focus:ring-2 focus:outline-none focus:ring-gray-300 font-primaryMedium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          OK
        </button>
        <button
          onClick={onGoCom1Click}
          className="text-black bg-red-300 hover:bg-red-400 focus:ring-2 focus:outline-none focus:ring-gray-300 font-primaryMedium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          Lần sau
        </button>
      </div>
    </div>
  );
};
