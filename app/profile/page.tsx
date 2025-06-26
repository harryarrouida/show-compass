"use client"

import { useState } from "react";
import { FaCrown, FaUserCircle, FaSignOutAlt, FaCheckCircle, FaStar, FaFilm, FaTv, FaRocket, FaTimesCircle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useTraktContext } from "@/contexts/traktContext";
import { useRouter } from "next/navigation";

const tabs = [
    {
        key: "premium",
        label: "Premium",
        icon: <FaCrown className="mr-2 text-yellow-500" />,
    },
    {
        key: "account",
        label: "Account",
        icon: <FaUserCircle className="mr-2 text-blue-400" />,
    },
];

const premiumFeatures = [
    {
        icon: <FaFilm className="text-blue-400" />,
        title: "Unlimited Recommendations",
        description: "Get unlimited AI-powered movie and TV show recommendations"
    },
    {
        icon: <FaTv className="text-blue-400" />,
        title: "Ad-Free Experience",
        description: "Enjoy an ad-free browsing experience across the entire platform"
    },
    {
        icon: <FaRocket className="text-blue-400" />,
        title: "Advanced Filters",
        description: "Control the recommendations based on your preferences"
    },
    {
        icon: <FaFilm className="text-blue-400" />,
        title: "Unlimited Recommendations",
        description: "Get unlimited AI-powered movie and TV show recommendations"
    },
    {
        icon: <FaTv className="text-blue-400" />,
        title: "Ad-Free Experience",
        description: "Enjoy an ad-free browsing experience across the entire platform"
    },
    {
        icon: <FaRocket className="text-blue-400" />,
        title: "Advanced Filters",
        description: "Control the recommendations based on your preferences"
    }
];

export default function Page() {
    const [activeTab, setActiveTab] = useState("premium");
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser, logout: authLogout } = useAuth();
    const { logout: traktLogout, login: traktLogin } = useTraktContext();
    const router = useRouter();
    const token = typeof window !== 'undefined' ? localStorage.getItem('traktToken') : null;

    const handleLogout = async () => {
        try {
            await authLogout();
            traktLogout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleCheckout = async () => {
        if (!currentUser) {
            // Redirect to login or show message
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.uid,
                }),
            });

            const { url } = await response.json();
            
            if (url) {
                window.location.href = url;
            } else {
                console.error('No checkout URL returned');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen py-12 px-6">
            {/* Header */}
            <div className="w-full max-w-6xl mb-12">
                <h1 className="text-4xl font-bold text-white mb-3">Profile</h1>
                <p className="text-text-secondary text-lg">Manage your account, premium features, and settings</p>
            </div>

            <div className="flex flex-col md:flex-row w-full max-w-6xl bg-background-secondary rounded-xl shadow-xl overflow-hidden border border-border-primary">
            {/* Left Sidebar */}
                <div className="w-full md:w-1/4 bg-background-secondary border-b md:border-b-0 md:border-r border-border-primary">
                    <div className="flex flex-row md:flex-col w-full">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center px-6 py-5 w-full text-left transition-colors
                                    ${activeTab === tab.key
                                        ? "bg-background-primary text-blue-400 font-semibold"
                                        : "hover:bg-background-primary/50 text-text-secondary"
                                    }
                                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                            `}
                        >
                            {tab.icon}
                                <span className="text-lg">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Content */}
                <div className="flex-1 bg-background-primary p-8 md:p-10">
                    {activeTab === "premium" && (
                        <div className="space-y-12">
                            {/* Premium Card */}
                            <div className="bg-gradient-to-br from-blue-900 to-background-secondary rounded-xl overflow-hidden shadow-xl border border-border-primary">
                                <div className="p-8 md:p-10">
                                    <div className="flex items-center mb-6">
                                        <FaCrown className="text-yellow-400 text-4xl mr-4" />
                                        <h2 className="text-3xl font-bold text-white">One lifetime payment</h2>
                                    </div>

                                    <p className="text-text-secondary text-lg mb-8">
                                        Unlock the full potential of Show Compass with our premium subscription.
                                        Get unlimited recommendations, ad-free experience, and more.
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-2">
                                        <div className="text-center sm:text-left">
                                            <div className="text-blue-400 font-semibold text-2xl">$9.99</div>
                                            <div className="text-text-secondary text-base">one time payment</div>
                                        </div>

                                        <button 
                                            onClick={handleCheckout}
                                            disabled={isLoading}
                                            className={`px-8 py-4 ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-3 text-lg`}
                                        >
                                            {isLoading ? (
                                                <>Processing...</>
                                            ) : (
                                                <>
                                                    <FaStar className="text-yellow-300" />
                                                    Upgrade Now
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Premium Features */}
                            <div>
                                <h3 className="text-2xl font-semibold text-white mb-6">Premium Features</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {premiumFeatures.map((feature, index) => (
                                        <div key={index} className="bg-background-secondary rounded-xl p-6 border border-border-primary hover:border-blue-500/50 transition-colors">
                                            <div className="flex items-center mb-4">
                                                <div className="p-3 bg-background-primary rounded-lg mr-4">
                                                    {feature.icon}
                                                </div>
                                                <h4 className="font-semibold text-lg text-white">{feature.title}</h4>
                                            </div>
                                            <p className="text-text-secondary text-base">{feature.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "account" && (
                        <div className="space-y-8">
                            {/* User Info Card */}
                            <div className="bg-background-secondary border border-border-primary rounded-xl p-6 flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-background-primary flex items-center justify-center text-3xl font-bold text-blue-400">
                                    {currentUser?.email?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                    <div className="font-semibold text-xl text-white">
                                        {currentUser?.displayName || "User"}
                                    </div>
                                    <div className="text-text-secondary text-base">
                                        {currentUser?.email || "user@example.com"}
                                    </div>
                                </div>
                            </div>

                            {/* Account Management */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-white">Account Management</h3>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-all hover:gap-3"
                                    >
                                        <span>Logout</span>
                                        <FaSignOutAlt />
                                    </button>
                                </div>

                                <div className="bg-gradient-to-br from-background-secondary to-background-primary border border-border-primary rounded-2xl p-8">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                        <div className="flex-shrink-0">
                                            <div className={`w-16 h-16 rounded-2xl ${token ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                                                {token ? (
                                                    <FaCheckCircle className="text-green-500 text-2xl" />
                                                ) : (
                                                    <FaTimesCircle className="text-red-500 text-2xl" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-grow">
                                            <h4 className="text-xl font-semibold text-white mb-2">Trakt Integration</h4>
                                            {token ? (
                                                <p className="text-text-secondary">Your account is successfully connected to Trakt. This allows you to sync your watchlist and track your viewing progress.</p>
                                            ) : (
                                                <p className="text-text-secondary">Connect your Trakt account to sync your watchlist and track your viewing progress across devices.</p>
                                            )}
                                        </div>

                                        <div className="flex-shrink-0">
                                            {token ? (
                                                <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                                                    Connected
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        traktLogin();
                                                    }}
                                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors"
                                                >
                                                    Connect Trakt
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-sm text-text-secondary text-center">
                                    Note: Logging out will disconnect you from all integrated services
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}