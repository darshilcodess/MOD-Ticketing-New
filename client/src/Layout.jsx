import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-[#0B1120] text-foreground font-sans selection:bg-primary/30">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
