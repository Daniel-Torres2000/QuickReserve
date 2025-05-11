import React, { useState } from 'react';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', formData);
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Sección izquierda - Formulario */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white px-8 py-12 shadow-md">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-[#333] mb-2">Welcome back !</h2>
            <p className="text-gray-600">Enter to get unlimited access to data & information.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your mail address"
              className="w-full mb-4 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d93025]"
              required
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full mb-4 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d93025]"
              required
            />

            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="mr-2"
                />
                Remember me
              </label>
              <a href="#" className="text-sm text-[#d93025] hover:underline">
                Forgot your password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#d93025] text-white py-3 rounded-md font-semibold hover:bg-[#b3201a] transition-colors"
            >
              Log In
            </button>

            <div className="my-6 text-center text-gray-500 text-sm">Or login with</div>

            <button
              type="button"
              className="w-full border border-gray-300 flex items-center justify-center py-2 rounded-md hover:bg-gray-100"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5 mr-2" />
              Sign up with Google
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don’t have an account?{' '}
              <a href="/register" className="text-[#d93025] font-medium hover:underline">
                Register here
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* Sección derecha - Imagen */}
      <div className="hidden md:block w-1/2">
        <img
          src="/assets/login-illustration.png" // <-- reemplaza con la ruta a tu imagen
          alt="Login Illustration"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default Login;
