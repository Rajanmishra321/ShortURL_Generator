import { useState } from 'react';
import  Login  from '../components/Login';
import  Signup  from '../components/Signup';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {isLogin ? (
        <Login 
          onSwitch={() => setIsLogin(false)} 
          onSuccess={onLogin} 
        />
      ) : (
        <Signup 
          onSwitch={() => setIsLogin(true)} 
          onSuccess={onLogin} 
        />
      )}
    </div>
  );
}