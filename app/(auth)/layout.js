export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">JUIT CMS</h1>
          <p className="text-blue-200 mt-1">Complaint Management System</p>
        </div>
        {children}
      </div>
    </div>
  );
}
