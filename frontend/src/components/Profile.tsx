import React from 'react';

const Profile: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">
                    JD
                </div>
                <div>
                    <h3 className="text-xl font-semibold">John Doe</h3>
                    <p className="text-gray-500">Software Engineering Student</p>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-lg mb-2">Preferences</h4>
                <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Remote</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Full-stack</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Machine Learning</span>
                </div>
            </div>
        </div>
    );
};

export default Profile;
