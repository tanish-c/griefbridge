import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

export default function Auth() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const isLogin = searchParams.get('mode') !== 'register';

  return (
    <div>
      <LoginForm />
    </div>
  );
}
