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
        <section className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                    Find the Best Course for You
                </h1>
                <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
                    Learn at your own pace, anytime, anywhere. Track your progress, attend lectures, and achieve your goals.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="mb-6 sm:mb-8 flex justify-center px-4 sm:px-0">
                    <div className="flex w-full max-w-md sm:max-w-2xl bg-white rounded-lg overflow-hidden">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search for courses..."
                            className="flex-grow px-4 sm:px-6 py-2 sm:py-3 text-gray-900 focus:outline-none text-sm sm:text-base"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 hover:bg-blue-700 transition flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                        >
                            <span>Search</span>
                        </button>
                    </div>
                </form>
                
                <div className="flex justify-center gap-4 px-4 sm:px-0">
                    <Link
                        to="/signup"
                        className="bg-white text-blue-600 font-semibold px-6 py-2 sm:py-3 rounded-lg shadow hover:bg-gray-100 transition text-sm sm:text-base w-full sm:w-auto max-w-xs"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
