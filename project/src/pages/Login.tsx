import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, CheckCircle, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  
  const { login, register, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if user came from email confirmation
  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    if (confirmed === 'true') {
      setSuccess('メールアドレスの確認が完了しました。ログインしてください。');
      setIsLogin(true);
    }
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowResendConfirmation(false);
    
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          // Navigation will be handled by the auth context automatically
          // when the user state is updated
        } else {
          // Handle specific error types
          if (result.error === 'email_not_confirmed') {
            setError('メールアドレスが確認されていません。登録時に送信された確認メールをご確認ください。');
            setShowResendConfirmation(true);
            setPendingEmail(email);
          } else if (result.error === 'invalid_credentials') {
            setError('メールアドレスまたはパスワードが正しくありません。');
          } else {
            setError('ログインに失敗しました。もう一度お試しください。');
          }
        }
      } else {
        if (!name.trim()) {
          setError('名前を入力してください。');
          return;
        }
        
        const success = await register(name, email, password, role);
        if (success) {
          setSuccess('登録が完了しました。確認メールを送信しましたので、メール内のリンクをクリックしてアカウントを有効化してください。');
          setIsLogin(true);
          // Clear form
          setName('');
          setEmail('');
          setPassword('');
        } else {
          setError('登録に失敗しました。既に使用されているメールアドレスの可能性があります。');
        }
      }
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。');
      console.error(err);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      const success = await resendConfirmation(pendingEmail);
      if (success) {
        setSuccess('確認メールを再送信しました。メールをご確認ください。');
        setShowResendConfirmation(false);
      } else {
        setError('確認メールの再送信に失敗しました。');
      }
    } catch (error) {
      setError('確認メールの再送信に失敗しました。');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            I Studio 予約システム
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'アカウントにログイン' : '新規アカウント登録'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {showResendConfirmation && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex items-center justify-between">
              <div className="flex">
                <Mail className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    確認メールが届いていませんか？
                  </p>
                </div>
              </div>
              <button
                onClick={handleResendConfirmation}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                再送信
              </button>
            </div>
          </div>
        )}

        {/* Registration success info */}
        {!isLogin && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <Mail className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  メール確認について
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    登録後、確認メールが送信されます。メール内のリンクをクリックしてアカウントを有効化してください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">名前</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="名前"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email-address" className="sr-only">メールアドレス</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">パスワード</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${!isLogin && role !== '' ? '' : 'rounded-b-md'} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {!isLogin && (
              <div>
                <label htmlFor="role" className="sr-only">役割</label>
                <select
                  id="role"
                  name="role"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'student' | 'teacher' | 'admin')}
                >
                  <option value="student">学生</option>
                  <option value="teacher">教員・SA</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              {isLogin ? 'ログイン' : '登録'}
            </button>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-sm">
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                  setShowResendConfirmation(false);
                }}
              >
                {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;