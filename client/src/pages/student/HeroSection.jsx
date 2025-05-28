import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <section className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white py-20 px-6">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Find the Best Course for You
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                    Learn at your own pace, anytime, anywhere. Track your progress, attend lectures, and achieve your goals.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="mb-8 flex justify-center">
                    <div className="flex max-w-2xl w-full bg-white rounded-lg overflow-hidden">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search for courses..."
                            className="flex-grow px-6 py-3 text-gray-900 focus:outline-none"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <span>Search</span>
                        </button>
                    </div>
                </form>
                
                <div className="flex justify-center gap-4">
                    <Link
                        to="/signup"
                        className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
