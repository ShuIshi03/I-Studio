import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">404</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            お探しのページが見つかりませんでした。
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mt-6">
            <Link
              to="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;